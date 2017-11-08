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
    
}