/* 利用自定义函数库coun-matrix.js创建旋转矩阵 */
//顶点着色器
var VSHADER_SOURCE =
'attribute vec4 a_Position;\n' +
'uniform mat4 u_ModelMatrix;\n' +
'void main() {\n' +
'  gl_Position = u_ModelMatrix * a_Position;\n' +
'}\n';

//片元着色器
var FSHADER_SOURCE =
'void main() {\n' +
'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
'}\n';

//旋转速度
var ANGLE_STEP = 45.0;

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

    //设置canvas背景色
    gl.clearColor(0.0,0.0,0.0,1.0);
    //获取u_ModerMatrix变量的存储位置
    var u_ModelMatrix = gl.getUniformLocation(gl.program,'u_ModelMatrix');
    if(!u_ModelMatrix){
        console.log('error');
        return;
    }
    
    //三角形的当前旋转角度
    var currentAngle = 0.0;
    //模型矩阵,Matrix4对象
    var modelMatrix = new Matrix4();

    //开始绘制三角形
    var tick = function(){
        currentAngle = animate(currentAngle);//更新旋转角
        draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix);
        requestAnimationFrame(tick);//请求浏览器调用tick
    };
    tick();
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

function draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix){
    //设置旋转矩阵
    modelMatrix.setRotate(currentAngle,0,0,1);

    //将旋转矩阵传输给顶点着色器
    gl.uniformMatrix4fv(u_ModelMatrix,false,u=modelMatrix.elements);

    //清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制三角形
    gl.drawArrays(gl.TRIANGLES,0,n);
}

//记录上一次调用函数的时刻
var g_last = Date.now();
function animate(angle){
    //计算距离上次调用经过多长的时间
    var now = Date.now();
    var elapsed = now - g_last;//ms
    g_last = now;
    //根据距离上次调用的时间更新当前旋转角度
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle;
}