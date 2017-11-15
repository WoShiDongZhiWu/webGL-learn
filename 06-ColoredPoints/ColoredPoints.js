/*
* 点击鼠标绘制点，点的颜色随位置变化
*/

//顶点着色器
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n'+
    'void main() {\n'+
    '   gl_Position = a_Position;\n'+
    '   gl_PointSize = 10.0; \n'+
    '}\n'
//片元着色器
var FSHADER_SOURCE = 
    'precision mediump float;\n'+
    'uniform vec4 u_FragColor;\n'+
    'void main() {\n'+
    '   gl_FragColor = u_FragColor;\n'+
    '}\n';

    function main(){
        //获取canvas
        var canvas = document.getElementById('webgl');
        //获取canvas的webgl的context
        var gl = canvas.getContext('webgl');
        if(!gl)
            {
                console.log('error');
                return;
            }
        //初始化着色器
        if(!initShaders(gl,VSHADER_SOURCE,FSHADER_SOURCE)){
            console.log('error');
            return;
        }
        //获取a_Position的存取位置
        var a_Position = gl.getAttribLocation(gl.program,'a_Position');
        if(a_Position< 0 ){
            console.log("error");
            return;
        }

        //获取u_FragColor 变量的存储位置
        var u_FragColor = gl.getUniformLocation(gl.program,'u_FragColor');
        if(u_FragColor< 0){
            console.log('error');
            return;
        }

        //注册鼠标点击时的事件响应函数
        canvas.onmousedown = function(ev){
            click(ev,gl,canvas,a_Position,u_FragColor)
        };
         //设置背景色
    gl.clearColor(0.0,0.0,0.0,1.0);
    //清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = [];//鼠标点击位置数组
var g_colors = [];//存储点颜色的数组
function click(ev,gl,canvas,a_Position,u_FragColor){
    var x = ev.clientX;//鼠标点击处的x坐标
    var y = ev.clientY;//鼠标点击处的y坐标
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left)-canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    //将坐标存储到g_points数组中
    g_points.push([x,y]);
    //将点的颜色存储到g_colors数组中
    if(x >= 0.0 && y >= 0.0){
        g_colors.push([1.0,0.0,0.0,1.0]);//第一象限，红色
    }else if(x < 0.0 && y < 0.0){
        g_colors.push([0.0,1.0,0.0,1.0])//第三象限，绿色
    }else{
        g_colors.push([1.0,1.0,1.0,1.0]);//其它，白色
    }

    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_points.length;
    for(var i = 0;i<len;i++){
        var xy = g_points[i];
        var rgba = g_colors[i];

        //将点的位置传输到a_Position变量中
        gl.vertexAttrib3f(a_Position,xy[0],xy[1],0.0);
        //将点的颜色传输到u_FragColor变量中
        gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);
        //绘制点
        gl.drawArrays(gl.POINTS,0,1);
    }
} 