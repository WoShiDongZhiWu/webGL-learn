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
var verticesSizes = new Float32Array([
    0.0,0.5,10.0,//第一个点
    -0.5,-0.5,20,//第二个点
    0.5,-0.5,30//第三个点
]);
var n = 3;

//创建缓冲区对象
var vertexSizeBuffer = gl.createBuffer();

//将顶点坐标写入缓冲区并开启
gl.bindBuffer(gl.ARRAY_BUFFER,vertexSizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesSizes, gl.STATIC_DRAW);

var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
//获取a_Position的存储位置，分配缓冲区并开启
var a_Position = gl.getAttribLocation(gl.program,'a_Position');
if(a_Position < 0){
    console.log('error');
    return;
}
gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*3,0);
gl.enableVertexAttribArray(a_Position);

//获取a_PointSize的位置，分配缓冲区并开启
var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
if(!a_PointSize){
    console.log('error');
    return;
}
gl.vertexAttribPointer(a_PointSize,1,gl.FLOAT,false,FSIZE*3,FSIZE*2);
gl.enableVertexAttribArray(a_PointSize);

return n;
}