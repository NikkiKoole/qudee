
module.exports.maskFlip = (data) ->
  # - white should become transparent
  # - black should become white
  
  whiteString = '#ffffff'
  blackString = '#000000'
  white = hexToRGB(whiteString)
  black = hexToRGB(blackString)

  # create fake image to calculate height / width
  img = document.createElement("img")
  img.src = data
  img.style.visibility = "hidden"
  document.body.appendChild img
  canvas = document.createElement("canvas")
  canvas.width = img.offsetWidth
  canvas.height = img.offsetHeight
  ctx = canvas.getContext("2d")
  ctx.drawImage img, 0, 0
  
  # remove image
  img.parentNode.removeChild img
  
  # do actual color replacement
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  data = imageData.data
  r = undefined
  g = undefined
  b = undefined
  x = 0
  len = data.length
  while x < len
    r = data[x]
    g = data[x + 1]
    b = data[x + 2]
    if (r is white.r) and (g is white.g) and (b is white.b)
      #making white transparent
      data[x + 3] = 0
    if (r is black.r) and (g is black.g) and (b is black.b)
      #making black white
      data[x] = white.r
      data[x + 1] = white.g
      data[x + 2] = white.b
    x += 4
  ctx.putImageData imageData, 0, 0
  canvas.toDataURL()


hexToRGB = (hexStr) ->
  col = {}
  col.r = parseInt(hexStr.substr(1, 2), 16)
  col.g = parseInt(hexStr.substr(3, 2), 16)
  col.b = parseInt(hexStr.substr(5, 2), 16)
  col
