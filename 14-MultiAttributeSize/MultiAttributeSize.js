/*  通过缓冲区向顶点着色器传入多个顶点相关数据   */
//顶点着色器
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n'+
    'attribute float a_PointSize;\n'+
    'void main(){\n'+
    '   gl_Position = a_Position;\n'+
    '   gl_PointSize = a_PointSize;\n'+
    '}\n';

//片元着色器
var FSHADER_SOURCE = 
    'void main(){\n'+
    '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
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

    //设置顶点信息
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('error');
        return;
    }

    //设置背景颜色
    gl.clearColor(0.0,0.0,0.0,1.0);

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制三个点
    gl.drawArrays(gl.POINTS, 0, n);
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    var n = 3;

    var sizes = new Float32Array([
        10.0,20.0,30.0//点的尺寸
    ]);

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    var sizeBuffer = gl.createBuffer();
    // if(!vertexBuffer||!sizeBuffer){
    //     console.log('error');
    //     return;
    // }

    //将顶点坐标写入缓冲区并开启
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position < 0){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_Position);

    //将顶点尺寸写入缓冲区对象并开启
    gl.bindBuffer(gl.ARRAY_BUFFER,sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,sizes,gl.STATIC_DRAW);
    var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
    if(!a_PointSize){
        console.log('error');
        return;
    }
    gl.vertexAttribPointer(a_PointSize,1,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}