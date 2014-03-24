Floorplan = require './floorplan'
{loadFloorPlan} = require './importer'

handleFileSelect = (event) ->
  loadFloorPlan 'data/' + event.target.files[0].name

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
  scene = Floorplan.get()

  background = gui.addFolder 'background'
  background.addColor(scene, 'backgroundColor').onChange (value) ->
    scene.setBackgroundColor value.replace('#', '0x')

  wall = gui.addFolder 'walls'
  wall.addColor(scene.wallLayer, 'color').onChange (value) ->
    scene.wallLayer.tint = value.replace('#', '0x')

  areas = gui.addFolder 'areas'
  areas.addColor(scene.areaLayer, 'color').onChange (value) ->
    scene.areaLayer.tint = value.replace('#', '0x')

  items = gui.addFolder 'items'
  items.addColor(scene.itemLayer, 'color').onChange (value) ->
    scene.itemLayer.tintItems value

  #loadFloorPlan 'data/rijksgebouwendienst.xml'
  world = new World()
  # now define a view.
  view = new View()
  view.setViewport 0,0,1,1
  view.setSize window.innerWidth,window.innerHeight
  view.setCenter 0,100
  view.render(world)
  view.interactive = true
  view.hitArea = new PIXI.Rectangle 0, 0, window.innerWidth, window.innerHeight
  mouseIsDown = false
  mouseDownStart = null
  view.mouseup = ->
    mouseIsDown = false
  view.mousemove = (e) ->
    if mouseIsDown
      p = e.getLocalPosition(view)
      x =  mouseDownStart.x - p.x
      y =  mouseDownStart.y - p.y
      mouseDownStart.x = p.x
      mouseDownStart.y = p.y
      view.move x, y
      view.render(world)
  view.mousedown = (e) ->
    mouseIsDown = true
    mouseDownStart = e.getLocalPosition(view)
    console.log e.getLocalPosition(view)
  window.move = (x, y) ->
    view.move x, y
    view.render(world)
    
  stage = new Stage(view)
  animate = () ->
    stats.begin()
    requestAnimFrame(animate)
    renderer.render(stage)
    stats.end()

  requestAnimFrame(animate)



# will contain one or more views
class Stage extends PIXI.Stage
  constructor: (view) ->
    super 0xff0000
    @addChild view
    
class World extends PIXI.DisplayObjectContainer
  constructor: ->
    super()
    @rectangles = []
    @createStuff()

  createStuff: ->
    for i in [0 ... 3000]
      @addRectangle(Math.random()*800,Math.random()*600,20,20,0xff0000)
     # @addRectangle(0,100,30,30,0x12ac45)
     # @addRectangle(10,50,30,30,0x12ff45)
   

  drawRectangles: ->
    for rect in @rectangles
      @addChild rect
      
  addRectangle: (x, y, width, height, color) ->
    @rectangles.push {x:x,y:y, width:width, height:height, color:color}
  
# A View looks at the floorplan
# -the floorplan is always defined and kept in its Floorplan Coordinate system
# -let's call it the World.
# the view is just a defined place of the World we are looking at.
# it's positioned around it's center, you position it by calling setCenter
# and feeding it it's middle point.
# the method named setSize is slightly ambigu, it sets the size OF THE WORLD we are looking at.
# it doesn't set the 'width' of the view itself, thats a responsibilty for the ViewPort.

isUnit = (value) ->
  (0 <= value <= 1.0)
  
class View extends PIXI.DisplayObjectContainer
  constructor: ->
    super()
    @vp = {x:0, y:0, width:1, height:1}
    @graphics = new PIXI.Graphics()
  setSize: (@width, @height) ->
  setCenter: (@cx, @cy) ->
  move: (x, y) ->
    @cx += x
    @cy += y
  setViewport: (x, y, width, height) ->
    if (not isUnit x) or (not isUnit y) or (not isUnit width) or (not isUnit height)
      throw Error 'setViewport only accepts float values between 0 and 1.'
    @vp ={x:x, y:y, width:width, height:height}
  render: (world) =>
    #does a lot, get data from world and when I see it, i construct it in my view.
    #create a yellow backdrop
    w = window.innerWidth
    h = window.innerHeight
    @graphics.clear()
    @graphics.beginFill 0xffff00
    vpScaleX = (@vp.width*w)/@width
    vpScaleY = (@vp.height*h)/@height
    
    @graphics.drawRect @vp.x * w, @vp.y * h, @vp.width*w, @vp.height*h
    for rect in world.rectangles
      @graphics.beginFill rect.color
      #console.log rect.color
      @graphics.drawRect (rect.x - (@cx - @width/2))*vpScaleX,
        (rect.y - (@cy - @height/2))*vpScaleY,
        rect.width*vpScaleX,
        rect.height*vpScaleY
      @graphics.endFill()
      
    @addChild(@graphics)


window.onload = ->
  init()

