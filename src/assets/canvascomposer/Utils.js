// UUID
import uuid from 'node-uuid'
export default {
  // Global
  layertop () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    if (obj) {
      obj.bringToFront()
      canvas.renderAll()
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
    }
  },
  layerup () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    if (obj) {
      obj.bringForward()
      canvas.renderAll()
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
    }
  },
  layerdown () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    if (obj) {
      obj.sendBackwards()
      canvas.renderAll()
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
    }
  },
  layerbottom () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    if (obj) {
      obj.sendToBack()
      canvas.renderAll()
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
    }
  },
  duplicate () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    var newObject
    if (obj) {
      // Slider Clone
      if (obj.type === 'slider' || obj.type === 'sliderE' || obj.type === 'sliderT') {
        if (obj.slides) {
          window.vue.$children[0].$emit('globalError', '已含有圖層的 Slider 物件無法複製，請建立新的 Slider。')
        } else {
          // Normal Clone
          newObject = obj.clone()
          // Move New Object
          newObject.left = newObject.left + 10
          newObject.top = newObject.top + 10
          // Assign a new id for new Object
          newObject.id = uuid.v4()
          canvas.add(newObject)
          canvas.setActiveObject(newObject)
          canvas.renderAll()
          window.vue.$children[0].$emit('updateHistory')
          window.vue.$children[0].$emit('closeContextMenu')
        }
      } else {
        // Normal Clone
        newObject = obj.clone()
        // Move New Object
        newObject.left = newObject.left + 10
        newObject.top = newObject.top + 10
        // Assign a new id for new Object
        newObject.id = uuid.v4()
        canvas.add(newObject)
        canvas.setActiveObject(newObject)
        canvas.renderAll()
        window.vue.$children[0].$emit('updateHistory')
        window.vue.$children[0].$emit('closeContextMenu')
      }
    }
  },
  lock () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    if (obj) {
      if (obj.lockMovementY === true) {
        obj.lockMovementY = false
        obj.lockMovementX = false
        obj.lockRotation = false
        obj.lockScalingX = false
        obj.lockScalingY = false
        obj.stroke = ''
        obj.strokeWidth = 0
        canvas.renderAll()
      } else {
        obj.lockMovementY = true
        obj.lockMovementX = true
        obj.lockRotation = true
        obj.lockScalingX = true
        obj.lockScalingY = true
        obj.stroke = '#ff0000'
        obj.strokeWidth = 4
        canvas.renderAll()
      }
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
    }
  },
  removeObject (cb) {
    var canvas = window['canvas']
    // Confirm before delete
    window.vue.$swal({
      title: '確定刪除？',
      text: '刪除後可使用 Ctrl + Z 組合鍵回復',
      type: 'warning',
      showCancelButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '確定刪除'
    }).then(() => {
      if (canvas.getActiveGroup()) {
        canvas.getActiveGroup().forEachObject(function (o) {
          canvas.remove(o)
        })
        canvas.discardActiveGroup().renderAll()
      } else if (canvas.getActiveObject()) {
        var singleObj = canvas.getActiveObject()
        if (singleObj._element !== undefined && singleObj._element.localName === 'video') {
          singleObj.getElement().pause()
          canvas.remove(singleObj)
        } else {
          canvas.remove(singleObj)
        }
        console.log('removed')
      } else {
        console.log('return')
        return
      }
      window.vue.$children[0].$emit('updateHistory')
      window.vue.$children[0].$emit('closeContextMenu')
      window.vue.$swal(
        '已刪除',
        '所選項目已刪除',
        'success'
      )
    })
    cb && cb()
  },
  loadClock (data, cb) {
    var fabric = window['fabric']
    var canvas = window['canvas']
    var objects = JSON.parse(data[0].clock)
    objects = objects.objects
    for (var i = 0; i < objects.length; i++) {
      var klass = fabric.util.getKlass(objects[i].type)
      if (klass.async) {
        klass.fromObject(objects[i], function (img) {
          canvas.add(img)
        })
      } else {
        var instance = klass.fromObject(objects[i])
        instance.id = uuid.v4()
        instance.name = 'Clock'
        canvas.add(instance)
        canvas.setActiveObject(instance)
        cb && cb(instance)
      }
    }
  },
  // Ratio
  lockRatio (ratio) {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    obj.width = Math.floor(obj.getWidth())
    obj.height = Math.floor(obj.width / ratio.w * ratio.h)
    obj.scaleX = 1
    obj.scaleY = 1
    obj.lockUniScaling = true
    canvas.renderAll()
  },
  unLockRatio () {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    obj.lockUniScaling = false
    canvas.renderAll()
  },
  get_param (param) {
    var vars = {}
    window.location.href.replace(window.location.hash, '').replace(/[?&]+([^=&]+)=?([^&]*)?/gi, function (m, key, value) {
      vars[key] = value !== undefined ? value : ''
    })
    if (param) {
      return vars[param] ? vars[param] : null
    }
    return vars
  },
  pushObject (direction, gap) {
    var canvas = window['canvas']
    var obj = canvas.getActiveObject()
    // if (direction === 'left') {
    //   goTo = obj.left
    // } else {
    //   goTo = obj.top
    // }
    switch (direction) {
      case 'left':
        if (obj.left <= 0) {
          obj.left = 0
        } else {
          obj.left = obj.left - gap
        }
        break
      case 'right':
        if (obj.left + obj.getWidth() >= obj.canvas.width) {
          obj.left = obj.canvas.width - obj.getWidth()
        } else {
          obj.left = obj.left + gap
        }
        break
      case 'up':
        if (obj.top <= 0) {
          obj.top = 0
        } else {
          obj.top = obj.top - gap
        }
        break
      case 'down':
        if (obj.top + obj.getHeight() >= obj.canvas.height) {
          obj.top = obj.canvas.height - obj.getHeight()
        } else {
          obj.top = obj.top + gap
        }
        break
    }
    canvas.renderAll()
  }
}
