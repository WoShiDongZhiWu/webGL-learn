/* 使用多幅纹理 */
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
    'uniform sampler2D u_Sampler0;\n'+
    'uniform sampler2D u_Sampler1;\n'+
    'varying vec2 v_TexCoord;\n'+
    'void main(){\n'+
    '   vec4 color0 = texture2D(u_Sampler0,v_TexCoord);\n'+
    '   vec4 color1 = texture2D(u_Sampler1,v_TexCoord);\n'+
    '   gl_FragColor = color0 * color1;\n'+
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
        //顶点坐标和纹理坐标
        -0.5,0.5,0.0,1.0,
        -0.5,-0.5,0.0,0.0,
        0.5,-0.5,1.0,1.0,
        0.5,0.5,1.0,0.0
    ]);
    var n =4;//顶点数量

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
    //创建缓冲区对象
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    if(texture0<0||texture1<0){
        console.log('error');
        return -1;
    }

    //获取u_Sampler1和u_Sampler2的存储位置
    var u_Sampler0 = gl.getUniformLocation(gl.program,'u_Sampler0');
    var u_Sampler1 = gl.getUniformLocation(gl.program,'u_Sampler1');
    if(!u_Sampler0||!u_Sampler1){
        console.log('error');
        return;
    }

    //创建image对象
    var image0 = new Image();
    var image1 = new Image();
    if(!image0||!image1){
        console.log('error');
        return;
    }  
    //注册时间响应函数，在图像加载完成后调用
    image0.onload = function(){loadTexture(gl,n,texture0,u_Sampler0,image0,0);};
    image1.onload = function(){loadTexture(gl,n,texture1,u_Sampler1,image1,1);};
    //告诉浏览器开始加载图像
    image0.src = '../resources/redflower.jpg';
    image1.src = '../resources/circle.gif';

    return true;
}
//标记纹理单元是否已经就绪
var g_texUnit0 = false,g_texUnit1 = false;
function loadTexture(gl,n,texture,u_Sampler,image,texUnit){
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);//旋转纹理Y轴
    //激活纹理
    if(texUnit == 0){
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    }else{
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }
    //绑定纹理对象到目标上
    gl.bindTexture(gl.TEXTURE_2D,texture);

    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    //设置纹理图像
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    //将纹理单元编号传递给取样器
    gl.uniform1i(u_Sampler,texUnit);
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    //绘制矩形
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    if(g_texUnit0 && g_texUnit1){
        gl.drawArrays(gl.TRIANGLE_STRIP,0,n)//绘制一个矩形
    }
}
