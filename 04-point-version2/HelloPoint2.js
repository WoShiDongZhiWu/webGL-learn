/*
attribute变量的理解与使用，实现javascript到shader着色器的传参

*/



//顶点着色器程序
var VSHADER_SOURCE = 
//设置attribute变量
'attribute vec4 a_Position;\n' +
'attribute float a_PointSize;\n' +

'void main() {\n'+
'gl_Position = a_Position;\n'+//设置坐标
'gl_PointSize = a_PointSize;\n' + //设置尺寸
'}\n';

//片元着色器程序
var FSHADER_SOURCE = 
'void main(){\n' + 
'gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n' + //设置颜色
'}\n';

function main(){
//获取cnavas元素
var canvas = document.getElementById('webgl');
//获取webgl绘图context
var gl = getWebGLContext(canvas);
if(!gl)
    {
        console.log("error");
        return;
    }

//初始化shader（着色器）,initShader()定义在/lib/cuon.util.js中
if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
    console.log("error");
    return;
}

//获取attribute变量的存储位置
var a_Position = gl.getAttribLocation(gl.program,'a_Position');
var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
if (a_Position < 0)
    {
        console.log('error');
        reutrn;
    }
//将顶点位置传输给attribute变量
gl.vertexAttrib3f(a_Position,0.5,0.5,0.0);

//将顶点大小传递给attribute变量
gl.vertexAttrib1f(a_PointSize,20.0);
//设置canvas的背景色
gl.clearColor(0.0,0.0,0.0,1.0);

//清空canvas
gl.clear(gl.COLOR_BUFFER_BIT);

//绘制一个点
gl.drawArrays(gl.POINTS,0,1);
}