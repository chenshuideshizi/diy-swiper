import { extend, dom, addEvent } from './utils'

class Swiper {
  constructor (el, options = {}) {
    const swiper = this
  
    swiper.el = typeof el === 'string' ? document.querySelector(el) : el // 容器元素
    swiper.amimating = false // 是否正在过渡
    swiper.movedDistance = 0  // touchend 时手指移动的距离
    swiper.slides = []  //  slides 集合
    
    // 默认选项
    const DEFAULT_OPTIONS = {
      initIndex: 0, // 设定初始化时slide的索引
      slidesPerView: 1,   // 设置 slider 容器能够同时显示的slides数量  Type: Number, Default: 1
      slideClassName: '.swiper-slide',
      containerClassName: '.swiper-wrapper',
      autoPlay: false,   // 是否自动播放 Type: Boolean || Function Default: false
      delay: 5000,
      speed: 300,
      loop: false, // 是否循环 Default: true
      navigation: {
        prevEl: '.swiper-button-prev',
        nextEl: '.swiper-button-next'
      },
      pagination: {
        el: '.swiper-pagination'
      }
    }



    this.options = extend(DEFAULT_OPTIONS, options)

    // 容器宽高
    let rect = this.el.getBoundingClientRect()
    this.offsetWidth = this.slideWidth = rect.width // 父容器宽度
    this.offsetHeight = rect.height // 父容器高度

    this.slidesContainer = dom(this.options.containerClassName)[0] // SlideContainer元素

    swiper.slides = dom(this.options.slideClassName, this.slidesContainer) // Slides 集合


    // 设置 swiper-slide 宽度
    if (this.options.slidesPerView < 1) {  
      this.options.slidesPerView = 1
    }

    let perSlideWidth = this.offsetWidth / this.options.slidesPerView 

    for (let i = 0; i < swiper.slides.length; i++) {
      swiper.slides[i].dataset.swiperSlideIndex = i
      swiper.slides[i].style.width =  `${perSlideWidth}px`
    }  
    this.slideCount = Math.ceil(swiper.slides.length / swiper.options.slidesPerView)


    this.slideIndex = 0  // 初始化索引
    this.prevSlideIndex = -1 // 上一次索引

    // 循环播放
    if (this.options.loop) {
      let fristSlides = swiper.slides[0].cloneNode(true)
      fristSlides.classList.add('swiper-slide-duplicate')
      let lastSlides = swiper.slides[swiper.slides.length - 1].cloneNode(true)
      lastSlides.classList.add('swiper-slide-duplicate')
      this.slidesContainer.appendChild(fristSlides)
      this.slidesContainer.insertBefore(lastSlides, this.slidesContainer.firstChild)
    }

    this.initEvent()

    this.activeIndex = this.options.initIndex
    
    // 是否自动切换
    if (this.options.autoPlay) {
      this.autoPlay()
    }

  }
  // 自动播放
  autoPlay () {
    var step = () => {
      setTimeout(() => {
        let prevSlideIndex = this.slideIndex
        let slideIndex = this.slideIndex + 1
        if (slideIndex === this.slideCount) {
          slideIndex = 0
        }
        this.slideTo(slideIndex, prevSlideIndex)
        step()
      }, this.options.delay)
    }
    step()
  }

  // 切换到下一个
  slideNext () {
    const swiper = this
    var slideIndex = swiper.slideIndex + 1
    this.slideTo(slideIndex)
  }

  // 切换到上一个
  slidePrev  () {
    const swiper = this
    let slideIndex = swiper.slideIndex - 1
    this.slideTo(slideIndex)
  }

  // 切换到指定下标的slide
  slideTo (slideIndex) {
    const swiper = this

    const speed = swiper.options.speed
    const slideWidth = this.slideWidth
    const slidesPerView = this.options.slidesPerView

    // 判断是否正在切换 slide
    if (swiper.animating === true) {
      return
    }

    // 修正slideIndex
    if (slideIndex < 0) {
      slideIndex = 0
    } else if (slideIndex > swiper.slidesContainer.querySelectorAll('.swiper-slide').length - 1) {
      slideIndex = swiper.slidesContainer.querySelectorAll('.swiper-slide').length - 1
    }

    // 如果通过导航切换，并且是第一个slide和最后一个slide的时候，直接返回
    if (swiper.movedDistance === 0 && swiper.slideIndex === slideIndex) {
      return
    }
    swiper.animating = true

    if (slideIndex !== this.slideIndex) {
      swiper.prevSlideIndex = this.slideIndex
      swiper.slideIndex = slideIndex 
      
      if (swiper.options.pagination) {
        let pagination = dom(swiper.options.pagination.el, swiper.el)[0]
        if (pagination) {
          let bullets = dom('.swiper-pagination-bullet', pagination)
          bullets[swiper.prevSlideIndex].classList.remove('swiper-pagination-bullet-active')
          bullets[swiper.slideIndex].classList.add('swiper-pagination-bullet-active')
        }
      }
    }

    this.slidesContainer.style.transitionProperty = 'transform'
    this.slidesContainer.style.transitionDuration = speed + 'ms'
    this.slidesContainer.style.transform = `translateX(-${slideWidth * slidesPerView * slideIndex}px)`

    swiper.slidesContainer.addEventListener('transitionend', function () {
      if (swiper.options.loop) {
        let length = swiper.slidesContainer.querySelectorAll('.swiper-slide').length
        if (swiper.slideIndex ===  length -1) {
          swiper.slidesContainer.style.transform = `translateX(-${slideWidth * slidesPerView * 1}px)`
          swiper.slideIndex = 1
          return
        }
        if (swiper.slideIndex === 0) {
          swiper.slideIndex = length - 2
          swiper.slidesContainer.style.transform = `translateX(-${slideWidth * slidesPerView * (length - 2)}px)`
          return
        }
      } 
      swiper.animating = false
      swiper.movedDistance = 0
    })
    
    setTimeout(() => {
      this.slidesContainer.style.transitionDuration = 0 + 'ms' 
    }, 0)
  }
}



  // 初始化
  Swiper.prototype.initEvent = function () {
    const swiper = this

    let tap, tapstart, tapmove, tapend
    if ('ontouchstart' in window) {
      tap = 'touchstart'
      tapstart = 'touchstart'
      tapmove = 'touchmove'
      tapend = 'touchend'
    } else {
      tap = 'click'
      tapstart = 'mousedown'
      tapmove = 'mousemove'
      tapend = 'mouseup'
    }

    // 是否点击切换
    if (this.options.navigation) {
      const { prevEl, nextEl } = this.options.navigation
      let prevBtn = this.el.querySelector(prevEl)
      let nextBtn = this.el.querySelector(nextEl)

      // 切换到上一个 slide
      prevEl && addEvent(prevBtn, tap, (e) => {
        swiper.slidePrev()
        e.stopPropagation()
      })
      //切换到下一个 slide
      nextBtn && addEvent(nextBtn, tap, (e) => {
        swiper.slideNext()
        e.stopPropagation()
      })
    } 

    // 添加小圆点
    if (swiper.options.pagination) {
      let pagination
      if (pagination = dom(swiper.options.pagination.el)[0]) {
        let bulletsHtml = ''
        for (let i = 0; i < swiper.slides.length; i++) {
          bulletsHtml += `<span class="swiper-pagination-bullet${i === 0 ? ' swiper-pagination-bullet-active' : ''}"></span>`
        }
        pagination.innerHTML = bulletsHtml
      }

    }

    let startX, startY
    let distanceX, distanceY
    console.log(startY, distanceY)

    

    swiper.el.addEventListener(tapstart, (e) => {
      if (swiper.animating) {
        return
      }
      startX = e.touches[0].pageX
      startY = e.touches[0].pageY

      let removeTouchmove = addEvent(swiper.el, tapmove, (e) => {
        distanceX = e.touches[0].pageX - startX
        swiper.slidesContainer.style.transform = `translateX(${-this.slideIndex * this.offsetWidth + distanceX}px)`
      })
  
      let removeTouchend = addEvent(swiper.el, tapend, (e) => {
        if (distanceX > 0) {
          swiper.movedDistance = distanceX
          if (distanceX / swiper.offsetWidth > 0.3) {
            swiper.slidePrev()
          } else {
            swiper.slideTo(swiper.slideIndex)
          }
        } else {
          swiper.movedDistance = distanceX
          if (Math.abs(distanceX) / swiper.offsetWidth > 0.3) {
            swiper.slideNext()
          } else {
            swiper.slideTo(swiper.slideIndex)
          }
        }
        swiper.startX = null
        swiper.startY = null
        swiper.distanceX = null
        swiper.distanceY = null
        removeTouchmove.remove()
        removeTouchend.remove()
      })
    })


  }
export default Swiper