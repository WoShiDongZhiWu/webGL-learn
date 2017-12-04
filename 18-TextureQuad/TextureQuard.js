/*  纹理  */
//顶点着色器
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n'+
    'attribute vec2 a_TexCoord;\n'+
    'varying vec2 v_TexCoord;\n'+
    'void main(){\n'+
    '   gl_Position = a_Position;\n'+
    '   v_TexCoord = a_TexCoord;\n'+
    '}\n';

//片元着色器
var FSHADER_SOURCE = 
    'precision mediump float;\n'+
    'uniform float u_Width;\n'+
    'uniform float u_Height;\n'+
    'uniform sampler2D u_Sampler;\n'+
    'varying vec2 v_TexCoord;\n'+
    'void main() { \n'+
    '   gl_FragColor = texture2D(u_Sampler,v_TexCoord);\n'+
    '}\n';

function main(){
    //获取canvas
    var canvas = document.getElementById('webgl');
    
    //获取canvas的context
    var gl = canvas.getContext('webgl');
    if(!gl){
        console.log('error');
        return;
    }

    //初始化着色器
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('error');
        return;
    }

    //设置顶点位置
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('error');
        return;
    }

    //设置背景色
    gl.clearColor(0.0,0.0,0.0,1.0);

    //配置纹理
    if(!initTextures(gl,n)){
        console.log('error');
        return;
    }
}

function initVertexBuffers(gl){
    var verticesTexCoords = new Float32Array([
        //顶点坐标，纹理坐标
        -0.5,0.5,0.0,1.0,
        -0.5,-0.5,0.0,0.0,
        0.5,0.5,1.0,1.0,
        0.5,-0.5,1.0,0.0
    ]);
    var n = 4;//顶点数目

    //创建缓冲区对象
    var vertexTexCoordBuffer = gl.createBuffer();
    if(!vertexTexCoordBuffer){
        console.log('error');
        return -1;
    }

    //将顶点坐标和纹理坐标写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,verticesTexCoords,gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    //获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE * 4,0);
    gl.enableVertexAttribArray(a_Position);

    //将纹理坐标分配给a_TexCoord并开启它
    var a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
    if(a_TexCoord<0){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_TexCoord,2,gl.FLOAT,false,FSIZE*4,FSIZE*2);
    gl.enableVertexAttribArray(a_TexCoord);//开启a_TexCoord

    return n;
}

function initTextures(gl,n){
    var texture = gl.createTexture();//创建纹理对象
    if(texture<0){
        console.log('error');
        return -1;
    }

    //获取u_Sampler的存储位置
    var u_Sampler = gl.getUniformLocation(gl.program,'u_Sampler');
    if(!u_Sampler){
        console.log('error');
        return;
    }

    var image = new Image();//创建一个image对象
    if(!image){
        console.log('error');
        return;
    }   
    //注册图像加载事件的响应函数
    image.onload = function(){loadTexture(gl,n,texture,u_Sampler,image);};
    //浏览器开始加载图像
    image.src = '../resources/sky.jpg';

    return true;
}

function loadTexture(gl,n,texture,u_Sampler,image){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);//对纹理图像进行y轴反转
    //开启0号纹理单元
    gl.activeTexture(gl.TEXTURE0);
    //向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D,texture);

    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);

    //将0号纹理传递给着色器
    gl.uniform1i(u_Sampler,0);

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //绘制矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n)
    ;
}