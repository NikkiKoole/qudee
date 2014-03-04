
window['receive_asset'] = (asset) ->

Floorplan = require './floorplan'
{createImage, changeColInUri, maskFlip} = require './utils'


loadAsset = (url, error, succes) ->
  $.ajax
    url: url
    dataType: 'jsonp'
    jsonpCallback: 'receive_asset'
    jsonp: 'callback'
    error: error
    success: succes


module.exports.loadJSONPAssets = (urlArray) ->
  # loads all urls in urlArray sequentially and by waiting for their turn.
 
  url = null  # the current url that's been loaded.
  delay = (ms, func) -> setTimeout func, ms

  error = (data) -> 
    console.log 'error',data
    advanceLoader(false)
  succes = (data) -> 
    scene = Floorplan.get()
    if data.under
      createImage data.under, url, '.under' 
      sprite =  new PIXI.Sprite.fromImage(url+'.under')
      scene.assetContainer.addChild(sprite)
    if data.color
      #newdata = data.color #maskFlip data.color 
      # TODO : this maskFlip function should be finished before continuing.
      # atm it messes up the dom because it's creating to many canvasses.
      # i *think* i need some promises to handle it justly
      newdata = maskFlip data.color 
      createImage newdata, url, '.color' 
      sprite =  new PIXI.Sprite.fromImage(url+'.color')
      scene.assetContainer.addChild(sprite)
      console.log 'data.color'
    if data.over 
      createImage data.over, url, '.over' 
      sprite =  new PIXI.Sprite.fromImage(url+'.over')
      scene.assetContainer.addChild(sprite)
    advanceLoader(true)
  
  advanceLoader = (hadSucces) ->
    console.log 'loader advancing'
    if urlArray.length > 0
      url = urlArray.pop()
      if hadSucces then loadAsset url, error, succes 
  
  advanceLoader(true)

