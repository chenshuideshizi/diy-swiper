function extend (target, o) {
  for (let p in o) {
    target[p] = o[p]
  }
  return target
}

function dom (elem, parentNode) {
  let idReg = /^#(\w|-)+/
  let classReg = /^\.(\w|-)+/
  let tagReg = /\w+/
  let eles = []

  if (idReg.test(elem)) {
    eles = [document.getElementById(elem.slice(1))]
  } else if (classReg.test(elem)) {
    let className = elem.slice(1)
    eles = (parentNode || document).getElementsByClassName(className)
  } else if (tagReg.test(elem)) {
    eles = (parentNode || document).getElementsByTagName(elem)
  } else {
    eles = (parentNode || document).querySelectorAll(elem)
  }

  return eles
}

function addEvent (el, type, handler) {
  el.addEventListener(type, handler)
  return {
    remove () {
      el.removeEventListener(type, handler)
    }
  }
}
function removeEvent (el, type, handler) {
  el.removeEventListener(type, handler)
}

export {
  extend,
  dom,
  addEvent,
  removeEvent
}