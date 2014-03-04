Floorplan = require './floorplan'
{loadJSONPAssets} = require './jsonploader'
{createImage} = require './utils'

MYDECO_QUERY = "http://mydeco3d.com/ws/search/product?db=component&display=renders&display=surface_height&display=bounding_box&display=wall_mounted&display=level&display=model"
CDN = 'http://cdn.floorplanner.com/assets/'

module.exports.loadFloorPlan = (url) ->
  xmlhttp = new XMLHttpRequest()
  xmlhttp.onreadystatechange = ->
    if xmlhttp.readyState == 4 and xmlhttp.status == 200
      if endsWith url, '.xml'
        parseString xmlhttp.responseText, (err, result) ->
          constructFloorplanFromFML result
      else if endsWith url, '.json'
        constructFloorplanFromRS JSON.parse xmlhttp.responseText
        
  xmlhttp.open("GET",url, false)
  xmlhttp.send()

getJSON = (query, callback) ->
  xhr = new XMLHttpRequest()
  xhr.onreadystatechange = ->
    if xhr.readyState is 4 and xhr.status is 200
      obj = JSON.parse xhr.responseText
      callback obj
  xhr.open 'GET', query, true
  xhr.send()


constructQuery = (components) ->
  query = MYDECO_QUERY
  if typeof components is 'object'
    for c in components
      query += "&id=" + c.component_id
  else query += "&id=" + components
  query



constructFloorplanFromRS = (rs) ->
  scene = Floorplan.get()
  scene.destroyData()
   
  plan = rs.model.plan
  for k,wall of plan.walls
    thickness = wall.thickness
    a = plan.points[wall.indices[0]]
    b = plan.points[wall.indices[1]]
    scene.addWall {x:parseInt(a[0]), y:parseInt(a[1]*-1)},
                  {x:parseInt(b[0]), y:parseInt(b[1]*-1)}, thickness+2

  scene.drawWalls()
  
  for k,area of plan.areas
    arr = []
    for pIndex in area.indices
      p = plan.points[pIndex]
      arr.push {x:p[0], y:p[1]*-1}
    scene.drawArea arr
    

  query = constructQuery rs.model.components

  onRSAssetsLoaded = () =>
    for k,v of PIXI.TextureCache
      console.log k,v
      sprite =  new PIXI.Sprite.fromImage(v)
      if sprite then console.log sprite
      console.log scene
      scene.assetContainer.addChild(sprite)

  getJSON query, (data) -> 
    urls = []
    for k, v of data.products when v isnt null
      urls.push v.renders[0].top
    loader = new PIXI.AssetLoader(urls, true)
    loader.onComplete = onRSAssetsLoaded
    loader.load()

  

constructFloorplanFromFML = (fml) ->
  MULTIPLIER = 100 
  scene = Floorplan.get()
  scene.destroyData()
  root = null
  if fml.hasOwnProperty 'design' # the normal one
    root = fml.design
  else if fml.hasOwnProperty 'project' # the portal one
    root = fml.project.floors[0].floor[0].designs[0].design[0]
  else 
    console.log 'unknown', fml
  
  lines = root.lines[0].line
  areas = root.areas[0].area
  assets = root.assets[0].asset

  for area in areas
    outPoints = []
    prePoints = area.points[0].split(",")
    for point in prePoints
      [x1, y1, z1, x2, y2, z2] = point.split(" ")
      outPoints.push {x:x1 * MULTIPLIER, y:y1 * MULTIPLIER}
      outPoints.push {x:x2 * MULTIPLIER, y:y2 * MULTIPLIER}
    scene.drawArea outPoints

  for line in lines
    if line.type[0] is 'default_wall'#'normal_wall'
      [x1, y1, z1, x2, y2, z2] = line.points[0].split(" ")
      a = {x:parseInt(x1 * MULTIPLIER), y:parseInt(y1 * MULTIPLIER)}
      b = {x:parseInt(x2 * MULTIPLIER), y:parseInt(y2 * MULTIPLIER)}
      scene.addWall a, b, line.thickness[0] * MULTIPLIER
    else
      console.log "#{line.type[0]} not drawn." 
  assetURLS = []
  for asset in assets
    if endsWith asset.url2d[0], 'flz' 
      url = CDN+asset.url2d[0].replace('flz/','jsonp/').replace('.flz','.jsonp')
      assetURLS.push url
    else
      console.log "not handling file #{asset.url2d[0]} yet"
  loadJSONPAssets assetURLS
  scene.drawWalls()



  console.log "lines: #{lines.length}, areas: #{areas.length}"

endsWith=(str, suffix) ->
    str.indexOf(suffix, str.length - suffix.length) isnt -1

