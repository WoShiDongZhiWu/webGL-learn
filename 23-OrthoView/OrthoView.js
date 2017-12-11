//设置盒状可视空间
//顶点着色器
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n'+
'attribute vec4 a_Color;\n'+
'uniform mat4 u_ProjMatrix;\n'+//传入视图矩阵
'varying vec4 v_Color;\n'+//varying 变量
'void main(){\n'+
'   gl_Position = u_ProjMatrix * a_Position;\n'+//视图矩阵与顶点坐标相乘
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
//获取nearFar元素
var nf = document.getElementById('nearFar');

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

//获取u_ProjMatrix的存储位置
var u_ProjMatrix = gl.getUniformLocation(gl.program,'u_ProjMatrix');
if(!u_ProjMatrix){
    console.log('error');
    return;
}

//创建矩阵以设置视点和视线
var ProjMatrix = new Matrix4();
//注册时间响应函数
document.onkeydown = function(ev){keydown(ev,gl,n,u_ProjMatrix,ProjMatrix,nf);};

draw(gl,n,u_ProjMatrix,ProjMatrix,nf);//绘制三角形
}

function initVertexBuffers(gl){
var verticesColors = new Float32Array([
    //顶点坐标和颜色
    0.0,0.5,-0.4,0.4,1.0,0.4,
    -0.5,-0.5,-0.4,0.4,1.0,0.4,
    0.5,-0.5,-0.4,1.0,0.4,0.4,//绿色三角形在最后面

    0.5,0.4,-0.2,1.0,0.4,0.4,//黄色三角形在中间
    -0.5,0.4,-0.2,1.0,1.0,0.4,
    0.0,-0.6,-0.2,1.0,1.0,0.4,

    0.0,0.5,0.0,0.4,0.4,1.0,
    -0.5,-0.5,0.0,0.4,0.4,1.0,//蓝色三角形在最前边
    0.5,-0.5,0.0,1.0,0.4,0.4
]);
var n = 9;//顶点数量

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
gl.vertexAttribPointer(a_Position,3,gl.FLOAT,false,FSIZE*6,0);
gl.enableVertexAttribArray(a_Position);//开启缓冲区分配

//获取a_Color的存储位置，分配缓冲区并开启
var a_Color = gl.getAttribLocation(gl.program,'a_Color');
if(!a_Color){
    console.log('error');
    return;
}
gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*6,FSIZE*3);
gl.enableVertexAttribArray(a_Color);//开启缓冲区分配

return n;
}
//视点与近、远裁剪面的距离
var g_near = 0.0, g_far = 0.5;
function keydown(ev,gl,n,u_ProjMatrix,ProjMatrix,nf){
    switch(ev.keyCode){
        case 39:g_near += 0.01;break;//按右方向键
        case 37:g_near -= 0.01;break;//按左方向键
        case 38:g_far += 0.01;break;//按上方向键
        case 40:g_far -= 0.01;break;//按下方向键
        default:return;//按下其他键
    }

    draw(gl,n,u_ProjMatrix,ProjMatrix,nf);//绘制三角形
}

function draw(gl,n,u_ProjMatrix,ProjMatrix,nf){
    //使用矩阵设置可视空间
    ProjMatrix.setOrtho(-1,1,-1,1,g_near,g_far);

    //将投影矩阵传给u_ProjMatrix变量
    gl.uniformMatrix4fv(u_ProjMatrix,false,ProjMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT);//清除canvas

    //显示当前的far和near值
    nf.innerHTML = 'near' + Math.round(g_near * 100)/100 + ',far:' + Math.round(g_far*100)/100;

    gl.drawArrays(gl.TRIANGLES, 0, n);//绘制三角形
}