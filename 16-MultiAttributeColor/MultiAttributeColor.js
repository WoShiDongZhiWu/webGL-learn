/* 通过顶点着色器将varying颜色传递给片元着色器，使用交错组织 */
//顶点着色器
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n'+
    'attribute vec4 a_Color;\n'+
    'varying vec4 v_Color;\n'+//varying 变量
    'void main(){\n'+
    '   gl_Position = a_Position;\n'+
    '   gl_PointSize = 10.0;\n'+
    '   v_Color = a_Color;\n'+//将数据传给片元着色器
    '}\n';
//片元着色器
var FSHADER_SOURCE = 
    '#ifdef GL_ES\n' +//?
    'precision mediump float;\n' + //? 第六章
    '#endif \n' +//?
    'varying vec4 v_Color;\n'+
    'void main(){\n'+
    '   gl_FragColor = v_Color;\n'+//从顶点着色器接收颜色数据 
    '}\n';

function main(){
    //获取canvas
    var canvas = document.getElementById('webgl');
    
    //获取canvas的context
    var gl = canvas.getContext('webgl');
    if(!gl){
        console.log('gl error');
        return;
    }

    //初始化着色器
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log('error');
        return;
    }

    //设置顶点的坐标和颜色
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('error');
        return;
    }

    //设置背景色
    gl.clearColor(0.0,0.0,0.0,1.0);

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制三角形
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl){
    var verticesColors = new Float32Array([
        //顶点坐标和颜色
        0.0,0.5,1.0,0.0,0.0,
        -0.5,-0.5,0.0,1.0,1.0,
        0.5,-0.5,0.0,0.0,1.0,
    ]);
    var n = 3;//顶点数量

    //创建缓冲区对象
    var vertexColorBuffer = gl.createBuffer();
    if(!vertexColorBuffer){
        console.log('error');
        return;
    }

    //将顶点坐标和颜色写入缓冲区对象
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,verticesColors,gl.STATIC_DRAW);

    var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    //获取a_Position的存储位置，分配缓冲区并开启
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*5,0);
    gl.enableVertexAttribArray(a_Position);//开启缓冲区分配

    //获取a_Color的存储位置，分配缓冲区并开启
    var a_Color = gl.getAttribLocation(gl.program,'a_Color');
    if(!a_Color){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*5,FSIZE*2);
    gl.enableVertexAttribArray(a_Color);//开启缓冲区分配

    return n;
}