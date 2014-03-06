
window['receive_asset'] = (asset) ->

Floorplan = require './floorplan'
{maskFlip} = require './utils'
{Promise} = require 'es6-promise'

drawAllInCache = ->
  scene = Floorplan.get()
  for k,v of PIXI.TextureCache
    sprite =  new PIXI.Sprite.fromImage(k)
    scene.assetContainer.addChild(sprite)

module.exports.loadJSONPAssets = (urlArray) ->
  sequence = Promise.resolve()
  urlArray.forEach (url) ->
    sequence = sequence.then ->
      return getJSONP url
    .then (data) -> 
      return Promise.all([
        createImage data, 'under', url+'.under',
        #createImage data, 'color', url+'.color',
        createImage data, 'over', url+'.over'
      ])
    .then (data) -> 
      return createMask data[0]
      .then (data) -> return createImage data, 'shape', url+'.shape'

    .catch (data) -> console.log 'caught',data
  sequence.then () -> drawAllInCache()



createMask = (data) ->
  new Promise (resolve, reject) ->
    if data['color']
      mask = maskFlip data['color']
      img = new Image()
      img.onerror = -> reject mask
      img.onload = => resolve mask 
      img.src = mask
    else
      resolve data


getJSONP = (url) ->
  new Promise (resolve, reject) ->
    $.ajax
      url: url
      dataType: 'jsonp'
      jsonpCallback: 'receive_asset'
      jsonp: 'callback'
      error: (data) -> reject data
      success: (data) -> resolve data

createImage = (jsonp, layer, id) ->
  #layer is one of ['under','color','over']
  new Promise (resolve, reject) ->
    if jsonp[layer]
      imageBuilder(id, resolve(jsonp), reject(jsonp), jsonp[layer])
    else
      resolve(jsonp)

imageBuilder = (id, resolve, reject, src) ->
  image = new Image()
  image.onload = -> 
    baseTexture = new PIXI.BaseTexture image
    texture = new PIXI.Texture baseTexture
    PIXI.Texture.addTextureToCache texture,id
    resolve
  image.onerror = -> reject
  image.src = src






