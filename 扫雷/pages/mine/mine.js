// pages/mine/mine.js

const difficulty={
    primary:{
        column:9,
        row:9,
        mine_number:10
    },
    difficult:{
        column:16,
        row:16,
        mine_number:40
    },
    expert:{
        column:16,
        row:30,
        mine_number:99
    }
}
var map=[],mines=[]
Page({
    data:{
        level:'',
        cells:[],
        mines:[],
        row:'',
        column:'',
        mine_number:'',
        state:'recover',
        class_recover:'buttonR',
        class_mark:'buttonR',
        x:'',
        y:'',
        isFailed:'false',
        remainBlock:'',
        remainMine:'',
        remainFlag:''
    },
    recover:function(){
        this.setData({
            state:'recover',
            class_recover:'buttonR_tap',
            class_mark:'buttonR'
        })
    },
    mark:function(){
        this.setData({
            state:'mark',
            class_mark:'buttonR_tap',
            class_recover:'buttonR'
        })
    },

    tap:function(event){
        var x=event.currentTarget.dataset.row_num+1;
        var y=event.currentTarget.dataset.column_num+1;
        var column=this.data.column;
        var row=this.data.row;
        console.log(x,y);
        if(this.data.state=='recover')
    {       if(this.data.cells[(x-1)*column+y-1].markFlag==true){
        return;
    }
        if(this.data.cells[(x-1)*column+y-1].isMine==true){
                this.failure()
            }
            else if(this.data.cells[(x-1)*column+y-1].showFlag==false){
                let digit=(x-1)*column+y-1
                this.setData({
                    ['cells['+digit+'].showFlag']:true,
                    remainBlock:this.data.remainBlock-1
                })
                this.broad(x-1,y-1);
            }
        }
        else if(this.data.state=='mark'){
            var digit=(x-1)*column+y-1;
            if(this.data.remainFlag>=0){
                if(this.data.cells[digit].markFlag==true){
                    this.setData({
                        ['cells['+digit+'].markFlag']:false,
                        remainFlag:this.data.remainFlag+1
                    })
                    if(this.data.cells[digit].isMine==true){
                        this.setData({
                            remainMine:this.data.remainMine+1
                        })
                    }
                }
                else if(this.data.remainFlag==0){
                    return;
                }
                else if(this.data.cells[digit].markFlag==false){
                this.setData({
                    ['cells['+digit+'].markFlag']:true,
                    remainFlag:this.data.remainFlag-1
                })
                if(this.data.cells[digit].isMine==true){
                    this.setData({
                        remainMine:this.data.remainMine-1
                    })
                }
            }
            
        }
        else{
            return;
        }
    }
        this.checkIfwin();
    },
    broad:function(x,y){
        var column=this.data.column;
        var row=this.data.row;
        if(x<1||y<1||x>column||y>row){
            return;
        }
        if(this.data.cells[x*column+y].map>0){
            return;
        }
        else if(this.data.cells[x*column+y].map==0){
            if(this.data.cells[x*column+y].showFlag==true){
                return;
            }
            else{
                for(var i=x-1;i<=x+1;i++){
                    for(var j=y-1;j<=y+1;j++){
                        if(i==x&&j==y){
                            continue;
                        }
                        else{
                            this.broad(i,j);
                            this.setData({
                                remainBlock:this.data.remainBlock-1
                            })
                        }
                    }
                }
            }
        }
    },
    checkIfwin:function(){
        var that=this;
        if(this.data.remainBlock==0||this.data.remainMine==0){
            wx.showModal({
              cancelColor: '#008000',
              title:'你赢了',
              cancelText:'退出',
              confirmColor:'#00f000',
              confirmText:'确认',
              success(res){
                  if(res.cancel){
                      wx.navigateTo({
                        url: '/pages/index/index',
                      })
                  }
                  else if(res.confirm){
                    that.setData({
                        isFailed:true
                    })
                  }
              }
            })
        }
    },
    failure:function(){
        var that=this;
        wx.showModal({
          confirmlColor: '#008000',
          title:'你寄了',
          confirmText:'彳亍',
          showCancel:true,
          cancelText:'退出',
          cancelColor:'#00F000',
          success(res){
              if(res.cancel){
                  wx.navigateTo({
                    url: '/pages/index/index',
                  })
              }
              else{
                  that.setData({
                    isFailed:true
                  })
                  console.log(that.data.isFailed)
              }
          }

        })
    },
    judgeIfHave:function(mine){//判断是否重复生成
        let mines=this.data.mines;
        for(var i=0;i<mines.length;i++){
            if(JSON.stringify(mines[i])==JSON.stringify(mine)){
                return true;
            }
        }
        return false
    },
    count:function(coordinate){
        var sum=1;
        for(var i=coordinate[0]-1;i<=coordinate[0]+1;i++){
            for(var j=coordinate[1]-1;j<=coordinate[1]+1;j++){
                if(i<1||j<1||i>this.data.column||j>this.data.row){
                    continue
                }
                else{
                if(this.judgeIfHave({x:i,y:j,isMine:true})==true){
                    sum++;
                }
                }
            }
        }
        if(this.judgeIfHave({x:coordinate[0],y:coordinate[1],isMine:true})==false){
            sum--;
        }
        return sum;
    },
    resetGame:function(){
        this.setData({
            class_recover:'buttonR',
            class_mark:'buttonR',
            isFailed:false,
            cells:[],
            mines:[]
        })
        var level=difficulty[this.data.level];
        for(var i=0;i<level.mine_number;i++){
            var x=Math.floor(Math.random()*level.column+1);
            var y=Math.floor(Math.random()*level.row+1);
            var mine={x:x,y:y,isMine:true};
            if(this.judgeIfHave(mine)==false){
                let newn=this.data.mines;
                newn.push(mine)
                this.setData({
                    mines:newn
                })
            }
            else{
                i--;
            }
        }
        console.log(this.data.mines)
        for(var i=1;i<=level.row;i++){
            for(var j=1;j<=level.column;j++){
                var coordinate=[i,j]
                map[(i-1)*level.column+j-1]=this.count(coordinate)
            }
        }
        console.log(map)
        for(var i=1;i<=level.row;i++){
            for(var j=1;j<=level.column;j++){
                let cell={x:i,y:j,isMine:this.judgeIfHave({x:i,y:j,isMine:true}),map:map[(i-1)*level.column+j-1],showFlag:false,markFlag:false}
                let cells=this.data.cells;
                cells.push(cell)
                this.setData({
                    cells:cells
                })
            }
        }
        console.log(this.data.cells)
    },
    onLoad:function(options){
        var level=wx.getStorageSync('level')
        this.setData({
            level:level,
            row:difficulty[level].row,
            column:difficulty[level].column,
            mine_number:difficulty[level].mine_number,
            remainFlag:difficulty[level].mine_number,
            remainBlock:difficulty[level].row*difficulty[level].column-difficulty[level].mine_number,
            remainMine:difficulty[level].mine_number,
        },function(){
            wx.removeStorageSync('level')
        })
        console.log(level);
        this.resetGame();
    }
})