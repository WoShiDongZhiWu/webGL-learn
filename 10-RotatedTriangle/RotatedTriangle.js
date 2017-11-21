/*  旋转三角形  */
//顶点着色器
var VSHADER_SOURCE = 
    // x' = x cos b - y sin b
    // y' = y sin b + y cos b
    // z' = z
    'attribute vec4 a_Position;\n' +
    'uniform float u_CosB, u_SinB;\n' +
    'void main() {\n' +
    '   gl_Position.x = a_Position.x *u_CosB - a_Position.y * u_SinB;\n'+
    '   gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n'+
    '   gl_Position.z = a_Position.z;\n'+
    '   gl_Position.w = 1.0;\n'+
    '}\n';

//片元着色器
var FSHADER_SOURCE = 
    'void main(){\n'+
    '   gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'+
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

    //设置点的位置
    var n = initVertexBuffers(gl);
    if(n<0){
        console.log('error');
        return;
    }
    
    //将旋转图形所需的数据传输给顶点着色器
    var radian = Math.PI * ANGLE / 180.0;// 转为弧度
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    var u_CosB = gl.getUniformLocation(gl.program,'u_CosB');
    var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
    if(!u_CosB||!u_SinB){
        console.log('error');
        return;
    }
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB,sinB);

    //设置canvas 的背景色
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
    var n =3;//顶点的个数

    //创建缓冲区对象
    var vertexBuffer = gl.createBuffer();
    if(!vertexBuffer){
        console.log('error');
        return -1;
    }

    //将缓冲区对象绑定到目标
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);

    //向缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position <0){
        console.log('error');
        return;
    }

    //将缓冲区对象分配给a_Position
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,0,0);

    //enable
    gl.enableVertexAttribArray(a_Position);

    return n;
}