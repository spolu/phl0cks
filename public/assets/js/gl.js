/**
 * GL object
 *
 * @extends {}
 * 
 * @param spec {canvas, fov, near, far, pos, stype}
 */
var GL = function(spec, my) {
  var my = my || {};
  var _super = {};
  
  my.fov = spec.fov || 45;
  my.near = spec.near || 0.1;
  my.far = spec.far || 100.0;    
  my.pos = spec.pos || [0, 0, -10];

  my.stype = spec.stype || 'basic'

  /*****************************************************
   * FOR LATER USE WITH LIGHING                        *
   *****************************************************/
  /*
    my.shaders = {
      basic: { fs: 
               'precision mediump float;' + 
                '' +
                'varying vec2 vTextureCoord;' +
                'varying vec4 vColor;' +
                'varying vec3 vLightWeighting;' +
                '' +
                'uniform sampler2D uSampler;' +
                'uniform bool uHasTexture;' +
                '' +
                'void main(void) {' +
                '    if(!uHasTexture) {' +
                '        gl_FragColor = vec4(vColor.rgb * vLightWeighting, vColor.a);' +
                '    }' +
                '    else {' +
                '        vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));' +
                '        gl_FragColor = vec4(textureColor.rgb * vLightWeighting, textureColor.a);' +
                '    }' +
               '}',
               vs:
                'attribute vec3 aVertexPosition;' +
                'attribute vec3 aVertexNormal;' +
                'attribute vec4 aVertexColor;' +
                'attribute vec2 aTextureCoord;' +
                '' +
                'uniform mat4 uMVMatrix;' +
                'uniform mat4 uPMatrix;' +
                'uniform mat3 uNMatrix;' +
                '' +
                'uniform bool uHasTexture;' +
                'uniform bool uUseLighting;' +
                '' +
                'uniform vec3 uAmbientColor;' +
                '' +
                'uniform vec3 uLightingDirection;' +
                'uniform vec3 uDirectionalColor;' +
                '' +
                'varying vec2 vTextureCoord;' +
                'varying vec3 vLightWeighting;' +
                'varying vec4 vColor;' +
                '' +
                'void main(void) {' +
                '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
                '' +
                '    if(!uHasTexture) {' +
                '        vColor = aVertexColor;' +
                '    }' +
                '    else {' +
                '        vTextureCoord = aTextureCoord;' +
                '    }' +
                '' +
                '    if (!uUseLighting) {' +
                '        vLightWeighting = vec3(1.0, 1.0, 1.0);' +               
                '    }' +
                '    else {' +
                '        vec3 transformedNormal = uNMatrix * aVertexNormal;' +
                '        float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0);' +
                '        vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;' +
                '    }' +
               '}' }
    };
*/

  my.shaders = {
    basic: { fs: 
	     'precision mediump float;' + 
	     '' +
             'varying vec2 vTextureCoord;' +
	     'varying vec4 vColor;' +
             '' +
             'uniform sampler2D uSampler;' +
             'uniform int uHasTexture;' +
	     '' +
	     'void main(void) {' +
             '    if(uHasTexture == 0) {' +
	     '      gl_FragColor = vec4(vColor.rgb, vColor.a);' +
             '    } else {' +
             '      gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));' +
             '    }' +
	     '}',
	     vs:
	     'attribute vec3 aVertexPosition;' +
	     'attribute vec3 aVertexNormal;' +
	     'attribute vec4 aVertexColor;' +
             'attribute vec2 aTextureCoord;' +
	     '' +
	     'uniform mat4 uMVMatrix;' +
	     'uniform mat4 uPMatrix;' +
	     '' +
             'uniform int uHasTexture;' +
             '' +
	     'varying vec4 vColor;' +
             'varying vec2 vTextureCoord;' +
	     '' +
	     'void main(void) {' +
	     '    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);' +
             '    if(uHasTexture == 0) {' +
	     '      vColor = aVertexColor;' +
             '    } else {' +
             '      vTextureCoord = aTextureCoord;' +
             '    }' +
	     '}' }
  };
  
  my.canvas = spec.canvas;

  my.mvMatrix = mat4.create();
  my.pMatrix = mat4.create();
  my.mvMatrixStack = [];
  
  // public
  var setMatrixUniforms;
  var mvPushMatrix;
  var mvPopMatrix;
  var degToRad;    
  var clear;
  var animationFrame;

  // private
  var init;

  var that = {};

  setMatrixUniforms = function() {
    my.gl.uniformMatrix4fv(my.shader.pMatrixUniform, false, my.pMatrix);
    my.gl.uniformMatrix4fv(my.shader.mvMatrixUniform, false, my.mvMatrix);	
  };

  mvPushMatrix = function() {
    var copy = mat4.create();
    mat4.set(my.mvMatrix, copy);
    my.mvMatrixStack.push(copy);	
  };

  mvPopMatrix = function() {
    if (my.mvMatrixStack.length == 0) {
      throw new Error("Invalid popMatrix!");
    }
    my.mvMatrix = my.mvMatrixStack.pop();	
  };    

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };


  init = function() {
    try {
      my.gl = my.canvas.getContext("experimental-webgl");
      //my.gl = WebGLDebugUtils.makeDebugContext(my.canvas.getContext("experimental-webgl"));
    } 
    catch (e) {
      alert('Could not initialise WebGL: ' + e);
    }
    if (!my.gl) {
      alert('Could not initialise WebGL');
    }	

    var fshader = my.gl.createShader(my.gl.FRAGMENT_SHADER);
    my.gl.shaderSource(fshader, my.shaders[my.stype].fs);
    my.gl.compileShader(fshader);
    if(!my.gl.getShaderParameter(fshader, my.gl.COMPILE_STATUS)) {
      throw new Error(my.gl.getShaderInfoLog(fshader));
    }

    var vshader = my.gl.createShader(my.gl.VERTEX_SHADER);
    my.gl.shaderSource(vshader, my.shaders[my.stype].vs);
    my.gl.compileShader(vshader);
    if(!my.gl.getShaderParameter(vshader, my.gl.COMPILE_STATUS)) {
      throw new Error(my.gl.getShaderInfoLog(vshader));
    }

    my.shader = my.gl.createProgram();
    my.gl.attachShader(my.shader, vshader);
    my.gl.attachShader(my.shader, fshader);
    my.gl.linkProgram(my.shader);

    if (!my.gl.getProgramParameter(my.shader, my.gl.LINK_STATUS)) {
      throw new Error("Could not initialise shaders");
    }

    my.gl.useProgram(my.shader);

    my.shader.vertexPositionAttribute = my.gl.getAttribLocation(my.shader, "aVertexPosition");
    my.gl.enableVertexAttribArray(my.shader.vertexPositionAttribute);

    my.shader.vertexColorAttribute = my.gl.getAttribLocation(my.shader, "aVertexColor");
    my.gl.enableVertexAttribArray(my.shader.vertexColorAttribute);

    my.shader.textureCoordAttribute = my.gl.getAttribLocation(my.shader, "aTextureCoord");
    my.gl.enableVertexAttribArray(my.shader.textureCoordAttribute);

    my.shader.vertexNormalAttribute = my.gl.getAttribLocation(my.shader, "aVertexNormal");
    my.gl.enableVertexAttribArray(my.shader.vertexNormalAttribute);

    my.shader.pMatrixUniform = my.gl.getUniformLocation(my.shader, "uPMatrix");
    my.shader.mvMatrixUniform = my.gl.getUniformLocation(my.shader, "uMVMatrix");
    my.shader.hasTextureUniform = my.gl.getUniformLocation(my.shader, "uHasTexture");
    my.shader.samplerUniform = my.gl.getUniformLocation(my.shader, "uSampler");

    my.gl.enable(my.gl.DEPTH_TEST);
    my.gl.depthFunc(my.gl.LEQUAL);

    clear();
  };

  /**
   * Clears the current scene. Reinitialize Matrix Stack and Perspective.
   */
  clear = function() {
    my.gl.viewport(0, 0, my.canvas.width, my.canvas.height);
    my.gl.clear(my.gl.COLOR_BUFFER_BIT | my.gl.DEPTH_BUFFER_BIT);	
    mat4.perspective(my.fov, my.canvas.width / my.canvas.height, my.near, my.far, my.pMatrix);
    mat4.translate(my.pMatrix, my.pos);	
    mat4.identity(my.mvMatrix);
    my.mvMatrixStack = [];
  };

  /**
   * Retrieves the animationFrame and executes the callback at next frame
   * @param cb the callback to execute
   * @param elem the canvas elem as per browser interface
   */
  animationFrame = function(cb, elem) {
    (function() {
      return (window.requestAnimationFrame ||
	      window.webkitRequestAnimationFrame ||
	      window.mozRequestAnimationFrame ||
	      window.oRequestAnimationFrame ||
	      window.msRequestAnimationFrame ||
	      function(callback, element) {
		window.setTimeout(callback, 1000/60);
	      });
    })()(cb, elem);	
  };
  
  CELL.method(that, 'setMatrixUniforms', setMatrixUniforms);
  CELL.method(that, 'mvPushMatrix', mvPushMatrix);
  CELL.method(that, 'mvPopMatrix', mvPopMatrix);
  CELL.method(that, 'degToRad', degToRad);
  CELL.method(that, 'clear', clear);
  CELL.method(that, 'animationFrame', animationFrame);

  CELL.getter(that, 'mvMatrix', my, 'mvMatrix');
  CELL.getter(that, 'pMatrix', my, 'pMatrix');
  CELL.getter(that, 'shader', my, 'shader');
  CELL.getter(that, 'gl', my, 'gl');

  CELL.getter(that, 'near', my, 'near');
  CELL.getter(that, 'far', my, 'far');
  CELL.setter(that, 'fov', my, 'fov');
  CELL.setter(that, 'near', my, 'near');
  CELL.setter(that, 'far', my, 'far');
  CELL.setter(that, 'pos', my, 'pos');

  init();

  return that;
};
