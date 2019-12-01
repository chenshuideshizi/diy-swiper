(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Swiper = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function extend(target, o) {
    for (var p in o) {
      target[p] = o[p];
    }

    return target;
  }

  function dom(elem, parentNode) {
    var idReg = /^#(\w|-)+/;
    var classReg = /^\.(\w|-)+/;
    var tagReg = /\w+/;
    var eles = [];

    if (idReg.test(elem)) {
      eles = [document.getElementById(elem.slice(1))];
    } else if (classReg.test(elem)) {
      var className = elem.slice(1);
      eles = (parentNode || document).getElementsByClassName(className);
    } else if (tagReg.test(elem)) {
      eles = (parentNode || document).getElementsByTagName(elem);
    } else {
      eles = (parentNode || document).querySelectorAll(elem);
    }

    return eles;
  }

  function addEvent(el, type, handler) {
    el.addEventListener(type, handler);
    return {
      remove: function remove() {
        el.removeEventListener(type, handler);
      }
    };
  }

  var Swiper =
  /*#__PURE__*/
  function () {
    function Swiper(el) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Swiper);

      var swiper = this;
      swiper.el = typeof el === 'string' ? document.querySelector(el) : el; // 容器元素

      swiper.amimating = false; // 是否正在过渡

      swiper.movedDistance = 0; // touchend 时手指移动的距离

      swiper.slides = []; //  slides 集合
      // 默认选项

      var DEFAULT_OPTIONS = {
        initIndex: 0,
        // 设定初始化时slide的索引
        slidesPerView: 1,
        // 设置 slider 容器能够同时显示的slides数量  Type: Number, Default: 1
        slideClassName: '.swiper-slide',
        containerClassName: '.swiper-wrapper',
        autoPlay: false,
        // 是否自动播放 Type: Boolean || Function Default: false
        delay: 5000,
        speed: 300,
        loop: false,
        // 是否循环 Default: true
        navigation: {
          prevEl: '.swiper-button-prev',
          nextEl: '.swiper-button-next'
        },
        pagination: {
          el: '.swiper-pagination'
        }
      };
      this.options = extend(DEFAULT_OPTIONS, options); // 容器宽高

      var rect = this.el.getBoundingClientRect();
      this.offsetWidth = this.slideWidth = rect.width; // 父容器宽度

      this.offsetHeight = rect.height; // 父容器高度

      this.slidesContainer = dom(this.options.containerClassName)[0]; // SlideContainer元素

      swiper.slides = dom(this.options.slideClassName, this.slidesContainer); // Slides 集合
      // 设置 swiper-slide 宽度

      if (this.options.slidesPerView < 1) {
        this.options.slidesPerView = 1;
      }

      var perSlideWidth = this.offsetWidth / this.options.slidesPerView;

      for (var i = 0; i < swiper.slides.length; i++) {
        swiper.slides[i].dataset.swiperSlideIndex = i;
        swiper.slides[i].style.width = "".concat(perSlideWidth, "px");
      }

      this.slideCount = Math.ceil(swiper.slides.length / swiper.options.slidesPerView);
      this.slideIndex = 0; // 初始化索引

      this.prevSlideIndex = -1; // 上一次索引
      // 循环播放

      if (this.options.loop) {
        var fristSlides = swiper.slides[0].cloneNode(true);
        fristSlides.classList.add('swiper-slide-duplicate');
        var lastSlides = swiper.slides[swiper.slides.length - 1].cloneNode(true);
        lastSlides.classList.add('swiper-slide-duplicate');
        this.slidesContainer.appendChild(fristSlides);
        this.slidesContainer.insertBefore(lastSlides, this.slidesContainer.firstChild);
      }

      this.initEvent();
      this.activeIndex = this.options.initIndex; // 是否自动切换

      if (this.options.autoPlay) {
        this.autoPlay();
      }
    } // 自动播放


    _createClass(Swiper, [{
      key: "autoPlay",
      value: function autoPlay() {
        var _this = this;

        var step = function step() {
          setTimeout(function () {
            var prevSlideIndex = _this.slideIndex;
            var slideIndex = _this.slideIndex + 1;

            if (slideIndex === _this.slideCount) {
              slideIndex = 0;
            }

            _this.slideTo(slideIndex, prevSlideIndex);

            step();
          }, _this.options.delay);
        };

        step();
      } // 切换到下一个

    }, {
      key: "slideNext",
      value: function slideNext() {
        var swiper = this;
        var slideIndex = swiper.slideIndex + 1;
        this.slideTo(slideIndex);
      } // 切换到上一个

    }, {
      key: "slidePrev",
      value: function slidePrev() {
        var swiper = this;
        var slideIndex = swiper.slideIndex - 1;
        this.slideTo(slideIndex);
      } // 切换到指定下标的slide

    }, {
      key: "slideTo",
      value: function slideTo(slideIndex) {
        var _this2 = this;

        var swiper = this;
        var speed = swiper.options.speed;
        var slideWidth = this.slideWidth;
        var slidesPerView = this.options.slidesPerView; // 判断是否正在切换 slide

        if (swiper.animating === true) {
          return;
        } // 修正slideIndex


        if (slideIndex < 0) {
          slideIndex = 0;
        } else if (slideIndex > swiper.slidesContainer.querySelectorAll('.swiper-slide').length - 1) {
          slideIndex = swiper.slidesContainer.querySelectorAll('.swiper-slide').length - 1;
        } // 如果通过导航切换，并且是第一个slide和最后一个slide的时候，直接返回


        if (swiper.movedDistance === 0 && swiper.slideIndex === slideIndex) {
          return;
        }

        swiper.animating = true;

        if (slideIndex !== this.slideIndex) {
          swiper.prevSlideIndex = this.slideIndex;
          swiper.slideIndex = slideIndex;

          if (swiper.options.pagination) {
            var pagination = dom(swiper.options.pagination.el, swiper.el)[0];

            if (pagination) {
              var bullets = dom('.swiper-pagination-bullet', pagination);
              bullets[swiper.prevSlideIndex].classList.remove('swiper-pagination-bullet-active');
              bullets[swiper.slideIndex].classList.add('swiper-pagination-bullet-active');
            }
          }
        }

        this.slidesContainer.style.transitionProperty = 'transform';
        this.slidesContainer.style.transitionDuration = speed + 'ms';
        this.slidesContainer.style.transform = "translateX(-".concat(slideWidth * slidesPerView * slideIndex, "px)");
        swiper.slidesContainer.addEventListener('transitionend', function () {
          if (swiper.options.loop) {
            var length = swiper.slidesContainer.querySelectorAll('.swiper-slide').length;

            if (swiper.slideIndex === length - 1) {
              swiper.slidesContainer.style.transform = "translateX(-".concat(slideWidth * slidesPerView * 1, "px)");
              swiper.slideIndex = 1;
              return;
            }

            if (swiper.slideIndex === 0) {
              swiper.slideIndex = length - 2;
              swiper.slidesContainer.style.transform = "translateX(-".concat(slideWidth * slidesPerView * (length - 2), "px)");
              return;
            }
          }

          swiper.animating = false;
          swiper.movedDistance = 0;
        });
        setTimeout(function () {
          _this2.slidesContainer.style.transitionDuration = 0 + 'ms';
        }, 0);
      }
    }]);

    return Swiper;
  }(); // 初始化


  Swiper.prototype.initEvent = function () {
    var _this3 = this;

    var swiper = this;
    var tap, tapstart, tapmove, tapend;

    if ('ontouchstart' in window) {
      tap = 'touchstart';
      tapstart = 'touchstart';
      tapmove = 'touchmove';
      tapend = 'touchend';
    } else {
      tap = 'click';
      tapstart = 'mousedown';
      tapmove = 'mousemove';
      tapend = 'mouseup';
    } // 是否点击切换


    if (this.options.navigation) {
      var _this$options$navigat = this.options.navigation,
          prevEl = _this$options$navigat.prevEl,
          nextEl = _this$options$navigat.nextEl;
      var prevBtn = this.el.querySelector(prevEl);
      var nextBtn = this.el.querySelector(nextEl); // 切换到上一个 slide

      prevEl && addEvent(prevBtn, tap, function (e) {
        swiper.slidePrev();
        e.stopPropagation();
      }); //切换到下一个 slide

      nextBtn && addEvent(nextBtn, tap, function (e) {
        swiper.slideNext();
        e.stopPropagation();
      });
    } // 添加小圆点


    if (swiper.options.pagination) {
      var pagination;

      if (pagination = dom(swiper.options.pagination.el)[0]) {
        var bulletsHtml = '';

        for (var i = 0; i < swiper.slides.length; i++) {
          bulletsHtml += "<span class=\"swiper-pagination-bullet".concat(i === 0 ? ' swiper-pagination-bullet-active' : '', "\"></span>");
        }

        pagination.innerHTML = bulletsHtml;
      }
    }

    var startX, startY;
    var distanceX, distanceY;
    console.log(startY, distanceY);
    swiper.el.addEventListener(tapstart, function (e) {
      if (swiper.animating) {
        return;
      }

      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      var removeTouchmove = addEvent(swiper.el, tapmove, function (e) {
        distanceX = e.touches[0].pageX - startX;
        swiper.slidesContainer.style.transform = "translateX(".concat(-_this3.slideIndex * _this3.offsetWidth + distanceX, "px)");
      });
      var removeTouchend = addEvent(swiper.el, tapend, function (e) {
        if (distanceX > 0) {
          swiper.movedDistance = distanceX;

          if (distanceX / swiper.offsetWidth > 0.3) {
            swiper.slidePrev();
          } else {
            swiper.slideTo(swiper.slideIndex);
          }
        } else {
          swiper.movedDistance = distanceX;

          if (Math.abs(distanceX) / swiper.offsetWidth > 0.3) {
            swiper.slideNext();
          } else {
            swiper.slideTo(swiper.slideIndex);
          }
        }

        swiper.startX = null;
        swiper.startY = null;
        swiper.distanceX = null;
        swiper.distanceY = null;
        removeTouchmove.remove();
        removeTouchend.remove();
      });
    });
  };

  return Swiper;

}));
