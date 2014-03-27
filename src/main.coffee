Floorplan = require './floorplan'
{loadFloorPlan} = require './importer'
View = require './view'

# ###
# ###

handleFileSelect = (event) ->
  loadFloorPlan 'data/' + event.target.files[0].name, (plan) ->
    Floorplan.get().buildPlan plan

STAGE = {width:1600, height:1600}

init = ->

  stats = new Stats()
  stats.setMode(0)
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.right = '300px'
  stats.domElement.style.top = '0px'
  document.body.appendChild(stats.domElement)
  
  input = document.createElement("input")
  input.type = "file"
  input.id = "files"
  input.name = "files[]"
  input.addEventListener('change', handleFileSelect, false)
  document.body.appendChild input
  output = document.createElement('output')
  output.id = "list"
  document.body.appendChild output
  
  renderer = PIXI.autoDetectRenderer window.innerWidth, window.innerHeight, null, false, false
  document.body.appendChild renderer.view

  window.onresize = ->
    console.log window.innerWidth, window.innerHeight
    renderer.resize window.innerWidth, window.innerHeight
 
  gui = new dat.GUI()
  #scene = Floorplan.get()
  
  # background = gui.addFolder 'background'
  # background.addColor(scene, 'backgroundColor').onChange (value) ->
  #   scene.setBackgroundColor value.replace('#', '0x' )

  # wall = gui.addFolder 'walls'
  # wall.addColor(scene.wallLayer, 'color').onChange (value) ->
  #   scene.wallLayer.tint = value.replace('#', '0x')

  # areas = gui.addFolder 'areas'
  # areas.addColor(scene.areaLayer, 'color').onChange (value) ->
  #   scene.areaLayer.tint = value.replace('#', '0x')

  # items = gui.addFolder 'items'
  # items.addColor(scene.itemLayer, 'color').onChange (value) ->
  #   scene.itemLayer.tintItems value


  world = Floorplan.get()
  view = new View()
  view.setViewport 0,0,1,1
  view.setSize window.innerWidth,window.innerHeight
  view.setCenter 0,100

  loadFloorPlan 'data/een.xml',(plan) ->
    Floorplan.get().buildPlan plan
    view.render(world)
      
  view.interactive = true
  view.hitArea = new PIXI.Rectangle 0, 0, window.innerWidth, window.innerHeight
  mouseIsDown = false
  mouseDownStart = null

  document.body.onkeydown = (e) ->
    e = e or window.event
    keycode = event.charCode or event.keyCode
    if keycode is 90 #Z
      console.log 'enteren!!'
      #zoom in (scale word kleiner)
      scale = view.getScale()

      newScale = scale * 0.5
      console.log newScale
      view.setSize window.innerWidth*newScale,window.innerHeight*newScale
    if keycode is 88  #X
      #zoom out
      scale = view.getScale()
  view.mouseup = ->
    mouseIsDown = false

  view.mousemove = (e) ->
    if mouseIsDown
      p = e.getLocalPosition(view)
      x =  mouseDownStart.x - p.x
      y =  mouseDownStart.y - p.y
      mouseDownStart.x = p.x
      mouseDownStart.y = p.y
      scale = view.getScale()
      view.move x/scale, y/scale
      view.render(world)

  view.mousedown = (e) ->
    mouseIsDown = true
    mouseDownStart = e.getLocalPosition(view)
    console.log e.getLocalPosition(view)

  #window.move = (x, y) ->
  #  view.move x, y
  #  view.render(world)
    
  stage = new Stage(view)
  animate = () ->
    stats.begin()
    requestAnimFrame(animate)
    renderer.render(stage)
    stats.end()

  requestAnimFrame(animate)

# will contain one or more views (later)
class Stage extends PIXI.Stage
  constructor: (@view) ->
    super 0xff0000
    @addChild @view

window.onload = ->
  init()

