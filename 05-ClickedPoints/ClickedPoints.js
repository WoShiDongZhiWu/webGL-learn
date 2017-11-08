/*
* 点击鼠标绘制点
*/

//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' + 
    'void main(){\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;'+
    '}\n';
//片元着色器
var FSHADER_SOURCE = 
    'void main(){\n' +
    'gl_FragColor = vec4(1.0,0.0,0.0,1.0);\n'
    '}\n';

function main(){
    //获取canvas元素
    var canvas = document.getElementById('webgl');
    //获取canvas的context
    var gl = canvas.getContext("webgl");
    if(!gl){
        console.log("error");
        return;
    }
    //初始化着色器
    if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
        console.log("error");
        return;
    }
    //获取attribute变量的存储位置
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position< 0 ){
        console.log("error");
        return;
    }
    //注册鼠标点击事件响应函数
    canvas.onmousedown = function(ev){click(ev,gl,canvas,a_Position);};
    //设置背景色
    gl.clearColor(0.0,0.0,0.0,1.0);
    //清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];//鼠标点击位置的数组
function click(ev,gl,VSHADER_SOURCE,FSHADER_SOURCE){
    var x = ev.clientX;//鼠标点击处的x坐标
    var y = ev.clientY;//鼠标点击处的y坐标
    var rect = ev.target.getBoundingClientRect();//获取canvas的边界坐标
    x = ((x - rect.left))
}