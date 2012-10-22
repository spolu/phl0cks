/**
 * Sphere object
 *
 * @extends {}
 * 
 * @param spec {GL, latbands[30], lngbands[30], radius[5], textureLink[earth], useTexture[false]}
 */
var sphere = function(spec, my) {
  var my = my || {};
  var _super = {};
  
  my.GL = spec.GL;
  my.gl = spec.GL.gl();

  my.radius = spec.radius || 5.0;
  my.latbands = spec.latbands || 30;
  my.lngbands = spec.lngbands || 30;

  if(spec.useTexture)
    my.textured = 1;
  else
    my.textured = 0;

  my.textureLink = spec.textureLink || '/img/earth.gif';

  my.sphereVertexPositionBuffer = my.gl.createBuffer();
  my.sphereVertexTextureCoordBuffer = my.gl.createBuffer();
  my.sphereVertexColorBuffer = my.gl.createBuffer();
  my.sphereVertexIndexBuffer = my.gl.createBuffer();
  
  // public
  var setColor;    /* setColor([1.0, 1.0, 1.0, 1.0]); */
  var draw;        /* draw() */
  
  // private;
  var init;
  
  var that = {};
  
  /**
   * Sets the color of the current voxel
   * @param color rgba array     
   */
  setColor = function(color) {
    var colorCoordData = [];
    for (var latNumber=0; latNumber <= my.latbands; latNumber++) {
      for (var longNumber=0; longNumber <= my.lngbands; longNumber++) {
        colorCoordData.push(color[0]); // R
        colorCoordData.push(color[1]); // G
        colorCoordData.push(color[2]); // B
        colorCoordData.push(color[3]); // A
      }
    }
    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexColorBuffer);
    my.gl.bufferData(my.gl.ARRAY_BUFFER, new Float32Array(colorCoordData), my.gl.STATIC_DRAW);
    my.sphereVertexColorBuffer.itemSize = 4;
    my.sphereVertexColorBuffer.numItems = colorCoordData.length / 4;
  };

  /**
   * Draws the sphere using the current GL matrix context
   */
  draw = function() {
    my.gl.uniform1i(my.GL.shader().hasTextureUniform, my.textured ? 1 : 0);

    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexPositionBuffer);
    my.gl.vertexAttribPointer(my.GL.shader().vertexPositionAttribute, 
                              my.sphereVertexPositionBuffer.itemSize, my.gl.FLOAT, false, 0, 0);
    
    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexTextureCoordBuffer);
    my.gl.vertexAttribPointer(my.GL.shader().textureCoordAttribute, 
                              my.sphereVertexTextureCoordBuffer.itemSize, my.gl.FLOAT, false, 0, 0);

    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexColorBuffer);
    my.gl.vertexAttribPointer(my.GL.shader().vertexColorAttribute, 
                              my.sphereVertexColorBuffer.itemSize, my.gl.FLOAT, false, 0, 0);

    my.gl.activeTexture(my.gl.TEXTURE0);
    my.gl.bindTexture(my.gl.TEXTURE_2D, my.texture);
    my.gl.uniform1i(my.GL.shader().samplerUniform, 0);    

    my.gl.bindBuffer(my.gl.ELEMENT_ARRAY_BUFFER, my.sphereVertexIndexBuffer);
    my.GL.setMatrixUniforms();
    my.gl.drawElements(my.gl.TRIANGLES, my.sphereVertexIndexBuffer.numItems, my.gl.UNSIGNED_SHORT, 0);	
  };

  /**
   * Buffer initialization
   */
  init = function() {
    var vertexPositionData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= my.latbands; latNumber++) {
      var theta = latNumber * Math.PI / my.latbands;
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);

      for (var longNumber=0; longNumber <= my.lngbands; longNumber++) {
        var phi = longNumber * 2 * Math.PI / my.lngbands;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = cosTheta;
        var z = sinPhi * sinTheta;
        var u = 1 - (longNumber / my.lngbands);
        var v = 1 - (latNumber / my.latbands);

        textureCoordData.push(u);
        textureCoordData.push(v);
        vertexPositionData.push(my.radius * x);
        vertexPositionData.push(my.radius * y);
        vertexPositionData.push(my.radius * z);
      }
    }
  
    setColor([1.0, 1.0, 1.0, 1.0]);

    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexPositionBuffer);
    my.gl.bufferData(my.gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), my.gl.STATIC_DRAW);
    my.sphereVertexPositionBuffer.itemSize = 3;
    my.sphereVertexPositionBuffer.numItems = vertexPositionData / 3;

    my.gl.bindBuffer(my.gl.ARRAY_BUFFER, my.sphereVertexTextureCoordBuffer);
    my.gl.bufferData(my.gl.ARRAY_BUFFER, new Float32Array(textureCoordData), my.gl.STATIC_DRAW);
    my.sphereVertexTextureCoordBuffer.itemSize = 2;
    my.sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
    
    my.gl.bindBuffer(my.gl.ELEMENT_ARRAY_BUFFER, my.sphereVertexIndexBuffer);
    var indexData = [];
    for (var latNumber=0; latNumber < my.latbands; latNumber++) {
      for (var longNumber=0; longNumber < my.lngbands; longNumber++) {
        var first = (latNumber * (my.lngbands + 1)) + longNumber;
        var second = first + my.lngbands + 1;
        indexData.push(first);
        indexData.push(second);
        indexData.push(first + 1);

        indexData.push(second);
        indexData.push(second + 1);
        indexData.push(first + 1);
      }
    }
    my.gl.bufferData(my.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), my.gl.STATIC_DRAW);
    my.sphereVertexIndexBuffer.itemSize = 1;
    my.sphereVertexIndexBuffer.numItems = indexData.length;

    my.texture = my.gl.createTexture();
    my.texture.image = new Image();
    my.texture.image.src = my.textureLink;
    my.texture.image.onload = function() {
      my.gl.bindTexture(my.gl.TEXTURE_2D, my.texture);
      my.gl.pixelStorei(my.gl.UNPACK_FLIP_Y_WEBGL, true);
      my.gl.texImage2D(my.gl.TEXTURE_2D, 0, my.gl.RGBA, my.gl.RGBA, my.gl.UNSIGNED_BYTE, my.texture.image);
      my.gl.texParameteri(my.gl.TEXTURE_2D, my.gl.TEXTURE_MAG_FILTER, my.gl.NEAREST);
      my.gl.texParameteri(my.gl.TEXTURE_2D, my.gl.TEXTURE_MIN_FILTER, my.gl.NEAREST);
      my.gl.bindTexture(my.gl.TEXTURE_2D, null);
    }; 	
  };

  CELL.method(that, 'setColor', setColor);
  CELL.method(that, 'draw', draw);

  init();

  return that;
};
