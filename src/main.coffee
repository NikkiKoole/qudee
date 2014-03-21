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
  
  renderer = PIXI.autoDetectRenderer STAGE.width, STAGE.height, null, false, false
  document.body.appendChild renderer.view

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
    scene.tintItems value

  loadFloorPlan 'data/nuova.xml'
  
  animate = () ->
    stats.begin()
    requestAnimFrame(animate)
    renderer.render(Floorplan.get())
    stats.end()

  requestAnimFrame( animate )

window.onload = ->
  init()

