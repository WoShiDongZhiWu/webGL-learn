//顶点着色器程序
var VSHADER_SOURCE = 
'attribute vec4 a_Position;\n' +
'void main() {\n'+
'gl_Position = a_Position;\n'+//设置坐标
'gl_PointSize = 10.0;\n' + //设置尺寸
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

//设置canvas的背景色
gl.clearColor(0.0,0.0,0.0,1.0);

//清空canvas
gl.clear(gl.COLOR_BUFFER_BIT);

//绘制一个点
gl.drawArrays(gl.POINTS,0,1);
}