/*  使用矩阵完成三角形的旋转  */
//顶点着色器
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'uniform mat4 u_xformMatrix;\n' +
'void main() {\n' +
'  gl_Position = u_xformMatrix * a_Position;\n' +
'}\n';

//片元着色器
var FSHADER_SOURCE =
'void main() {\n' +
'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

//旋转角度
var ANGLE = 90.0;

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
        console.log('着色器 error');
        return;
        
    }

    //设置顶点位置
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('error');
        return;
    }

    //创建旋转矩阵
    var radian = Math.PI * ANGLE /180.0;//角度值转弧度值
    var cosB = Math.cos(radian), sinB = Math.sin(radian);

    //webGL中的矩阵是列主序
    var xformMatrix = new Float32Array([
        cosB,sinB,0.0,0.0,
        -sinB,cosB,0.0,0.0,
        0.0,0.0,1.0,0.0,
        0.0,0.0,0.0,1.0
    ]);

    //将旋转矩阵传输给顶点着色器
    var u_xformMatrix = gl.getUniformLocation(gl.program,'u_xformMatrix');
    if(!u_xformMatrix){
        console.log('error');
        return;
    }
    gl.uniformMatrix4fv(u_xformMatrix,false,xformMatrix);

    //设置canvas的背景色
    gl.clearColor(0.0,0.0,0.0,1.0);

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制三角形
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    var n = 3;//顶点的数量

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('error');
        return false;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);

    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position<0){
        console.log('error');
        return -1;
    }

    //将缓冲区对象分配给a_Position
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);

    //enanle
    gl.enableVertexAttribArray(a_Position);

    return n;
    
}