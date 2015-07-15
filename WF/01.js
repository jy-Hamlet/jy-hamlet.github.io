		J_I = 1;    //获取图片的JSON文件序号
		comment_I = 1; //获取评论的JSON文件序号
		card_N = 0; //卡片数
		c_N = 0;	//瀑布流列数
		cardWidth = 314; //card宽度
		c_textHeight = 40; //card文字内容所占高度
		containerWidth = 0; //大容器宽度
		winWidth = 0; //窗口宽度
		winHeight = 0; //窗口高度
		columnLength = []; //各列长度
		is_pic_end = 0;  //是否能加载图片
		is_comment_end = 0;  //是否还能加载评论
		var longi; //经度
		var lati; //纬度
	
		var ele = $('#container');
	
	
		//判断滚动条到达底部
		$(window).bind('scroll', function(){
			var scrollTop = $(window).scrollTop();
　　		var scrollHeight = $(document).height();
　　		var windowHeight = $(window).height();
　　		if(scrollTop + windowHeight == scrollHeight){
　　　　		var oldcardN = card_N;
				add_img();
　　		}
		});
		//获取经纬度	
		function getPosition(){
			if(navigator.geolocation){
				navigator.geolocation.getCurrentPosition(function(pos){
					lati = pos.coords.latitude;
					longi = pos.coords.longitude;	
						
					add_img();
					add_img();
					setWF_arg();
				}, function(err){
					switch(err.code) {
			        case err.TIMEOUT:
			            console.log("A timeout occured! Please try again!");
			            break;
			        case err.POSITION_UNAVAILABLE:
			            console.log('We can\'t detect your location. Sorry!');
			            break;
			        case err.PERMISSION_DENIED:
			            console.log('Please allow geolocation access for this to work.');
			            break;
			        case err.UNKNOWN_ERROR:
			            console.log('An unknown error occured!');
			            break;
					}
					add_img();
					add_img();
					setWF_arg();
					},{
        		enableHighAcuracy: false,
        		timeout: 10000,
        		maximumAge: 600000
				  });
			}
			else{
				alert("您的浏览器不支持定位！");
				add_img();
				add_img();
				setWF_arg();
			}
		}
		//计算距离	
		function calDis(lng1, lat1){
			var pi = 3.141592654;
			var cos = Math.cos;var sin = Math.sin;var arccos = Math.acos;
			return 6370.996*arccos(cos(lat1*pi/180 )*cos(lati*pi/180)*cos(lng1*pi/180 -longi*pi/180)+
				sin(lat1*pi/180 )*sin(lati*pi/180));
		}
		
		//图片指定宽度等比缩放
		ImgFitWidth = function(id,toWidth){
			var imgWidth=$("#"+id).width();
			var imgHeight=$("#"+id).height();
			var toHeight = parseInt(imgHeight*toWidth/imgWidth);
			$("#"+id).width(toWidth);
			$("#"+id).height(toHeight);

			return toHeight;
		}
		ImgFitWidth2 = function(id,toWidth){
			var imgWidth=$("#"+id).width();
			var imgHeight=$("#"+id).height();
			if (imgWidth <= toWidth){
				return imgHeight;
			}
			var toHeight = parseInt(imgHeight*toWidth/imgWidth);
			$("#"+id).width(toWidth);
			$("#"+id).height(toHeight);

			return toHeight;
		}		
		//load每张图片的同时将其放入瀑布流中
		putCardIntoWF = function(idnum){
		
			$("#img"+idnum).parent()[0].style.height = ImgFitWidth("img"+idnum, 300)+c_textHeight+'px';
			var theCard = $("#img"+idnum).parent();
			var shortestColumn = 0;
				shortestColumn = 0;
				for (var j = 0; j < c_N; j++){
					if (columnLength[j] < columnLength[shortestColumn]){
						shortestColumn = j;
					}
				}	
				theCard.parent()[0].style.left = shortestColumn*cardWidth+ 0 +'px';    ////////
				theCard.parent()[0].style.top = columnLength[shortestColumn] + 0 + 'px';  ///////
	
				columnLength[shortestColumn] += (theCard.height()+10+4);  //////////
		}
		//添加图片
		function add_img(){
			$('#loading_card').css('display', 'block');
			if (is_pic_end == 1){
				setTimeout("$('#loading_card').css('display', 'none');",3000);
			}

			$.ajax({url:"JSON/"+J_I+".json", datatype: "json",async:false,success: function(data){

						var toLoad = data;
						if(toLoad.pic.length == 0){
							is_pic_end = 1;
							$('#loading_card').children().html("没有更多图片了");
							setTimeout("$('#loading_card').css('display', 'none');",3000);
						}
						else{
							J_I++;

							var obj;
							for(var i = 0; i < toLoad.pic.length; i++){
								card_N++;

								var HtmlInCard = '<div class="c_card_inner" onclick="seeMore('+card_N+')" ><img id="img'+card_N+'" src="'+toLoad.pic[i].url+'" alt="图片加载中..." onload="putCardIntoWF('+card_N+');"  onerror="javascipt:this.alt=\'图片加载失败...\';this.src=\'\'"><p>本图距离你<span class="blue">'+parseInt(calDis(toLoad.pic[i].longitude,toLoad.pic[i].latitude))+'KM</span></p></div>';
								var new_ele = document.createElement('DIV');
								new_ele.className = "c_card";
								new_ele.style.left = "-900px";
								new_ele.innerHTML = HtmlInCard;

								$('#container').append(new_ele);
								
							}
							$('#loading_card').css('display', 'none');
						}
			}, 
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("加载失败！"+textStatus+","+XMLHttpRequest.status+','+XMLHttpRequest.readyState);}
			});
		}
		
		function setWF_arg(){
			winWidth = $('body').width();
			if (c_N != parseInt((winWidth - 20)/cardWidth)){
				c_N = parseInt((winWidth - 20)/cardWidth);
				containerWidth = c_N*cardWidth;
				ele[0].style.width = containerWidth + 'px';
				columnLength = new Array(c_N);
				for (var i = 0; i < c_N; i++){
					columnLength[i] = 0;
				}
			}
		}
		
		//调整瀑布流布局
		function setWF(){
			winWidth = $('body').width();
			if (c_N != parseInt((winWidth - 20)/cardWidth)){
				c_N = parseInt((winWidth - 20)/cardWidth);

				containerWidth = c_N*cardWidth;
				ele[0].style.width = containerWidth + 'px';

				columnLength = new Array(c_N);
				for (var i = 0; i < c_N; i++){
					columnLength[i] = 0;
				}
				
				var cardArr = ele.children();
				
				cardArr[0].style.left = '0px';
				cardArr[0].style.top = '0px';
				
				columnLength[0] = parseInt($(cardArr[0]).children().css('Height'))+10+4;    ///
				
				var shortestColumn = 0;
				for (var i = 1; i < card_N; i++){
					shortestColumn = 0;
					for (var j = 0; j < c_N; j++){
						if (columnLength[j] < columnLength[shortestColumn]){
							shortestColumn = j;
						}
					}
					
					cardArr[i].style.left = shortestColumn*cardWidth+ 0 +'px';    ////////
					cardArr[i].style.top = columnLength[shortestColumn] + 0 + 'px';  ///////
					columnLength[shortestColumn] += (parseInt($(cardArr[i]).children().css('Height'))+10+4);  //////////
				}
			}
		}
		ele_card = $($('#aWin').children()[1]);
		//弹层查看大图
		function seeMore(idnum){
			$('#aWin').css('display', 'block');
			$('body').css('overflow', 'hidden');
			var ele_pic = document.createElement('DIV');
			
			ele_pic.className = 'rm picdiv';
			ele_pic.innerHTML = '<img id="bigpic" src="'+$('#img'+idnum).attr('src')+'" onload="ImgFitWidth2(\'bigpic\',$(\'#bigpic\').parent().width()-20)"><br><button id="addC" onclick="addComment();">查看更多评论</button>';
			
			ele_card.append(ele_pic);
			addComment();
		}
		//加载评论
		function addComment(){
			if (is_comment_end === 1){
				return 0;
			}
			$.ajax({url:"JSON/1_"+comment_I+".json", datatype: "json",async:false,success: function(data){

					var toLoad = data;
					if(toLoad.comment.length == 0){
						is_comment_end = 1;
						$('#addC').html("没有更多评论");
					}
					else{
						comment_I++;
						for(var i = 0; i < toLoad.comment.length; i++){
								var new_ele = document.createElement('DIV');
								new_ele.innerHTML = '<div class="cardbox"><p><span class="blue">'+toLoad.comment[i].name+'<span>:</p><p>'+toLoad.comment[i].said+'</p></div>';
								$('#addC').before(new_ele);	
							}
						}
			}, 
			error: function(XMLHttpRequest, textStatus, errorThrown){
				alert("加载失败！"+textStatus+","+XMLHttpRequest.status+','+XMLHttpRequest.readyState);}
			});
		}
		//关闭弹层
		function closeWin(){
			$('#aWin').css('display', 'none');
			ele_card.children('.rm').remove();
			comment_I = 1;
			is_comment_end = 0;
			$('body').css('overflow','auto');
		}
		
		
		window.onload = function(){
			getPosition();
		};
		window.onresize = function(){setWF();};
		
