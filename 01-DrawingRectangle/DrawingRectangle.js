function main(){
    //获取canvas元素
    var canvas = document.getElementById('example');
    if(!canvas){
        console.log('error');
        return;
    }

    //获取绘制二维图形的context
    var ctx = canvas.getContext('2d');

    //绘制蓝色矩形
    ctx.fillStyle = 'rgba(0,0,255,1.0)';//设置填充颜色为蓝色
    ctx.fillRect(120,10,150,150);//设置矩形，X，y,width,height

}