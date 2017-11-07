function main(){
    //获取canvas元素
    var canvas = document.getElementById('webgl');
    
    //获取webgl绘图context

    //var gl = getWebGLContext(canvas);//对原始函数进行了封装，隐藏不同浏览器之间的差异
    var gl = canvas.getContext('webgl');//只适用于chrome

    if(!gl){
        console.log('error');
        return;
    }
    //指定清空canvas的颜色
    gl.clearColor(0,0,0,1);
    //清空canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}