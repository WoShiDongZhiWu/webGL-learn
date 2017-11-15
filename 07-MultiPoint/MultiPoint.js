/*
* 使用缓冲区对象，实现绘制多个点
*/

//顶点着色器
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n'+
    'void main() { \n'+
    '   gl_Position = a_Position;\n'+
    '   gl_PointSize = 10.0;\n'+
    '}\n';
//片元着色器
var FSHADER_SOURCE = 
    'void main() { \n'+
    '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
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
    
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 绘制3个点
    gl.drawArrays(gl.POINTS,0,n);//n is 3
}

function initVertexBuffers(gl){
    var vertices = new Float32Array([
        0.0,0.5,-0.5,-0.5,0.5,-0.5
    ]);
    var n = 3;//点的个数

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('error');
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if(a_Position<0){
        console.log('error');
        return;
    }
    //将缓冲区对象分配给a_Position变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0 , 0);

    //连接a_Position变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}