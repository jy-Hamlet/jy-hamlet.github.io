	var userlistRef = new Firebase('https://sizzling-torch-9606.firebaseio.com/userlist/');  //聊天室成员列表
	var messagesRef = new Firebase('https://sizzling-torch-9606.firebaseio.com/messagelist/');  //消息列表
	var messageField = $('#messageInput');  //指向输入框
	var messageList = $('#messagelist');   //指向消息列表框
	var userList = $('#userlist');  //指向成员列表框
	var name = null;  //当前用户名
	var namelist = {};  //成员列表本地版
	var userElement;   //创建div用的辅助变量
	
	//从服务器获取一次完整成员列表
	userlistRef.once("value", function(snapshot){
		snapshot.forEach(function(childSnapshot){
			//console.log(childSnapshot.key());
			namelist[childSnapshot.key()] = true; //将列表存到本地
		});		
		start();  //获取列表结束，开始构造网页
		return false;
	});
	//构造网页
	function start(){
		//对服务器端成员列表的更新添加监听
		userlistRef.on("child_added", function(snapshot){
			namelist[snapshot.key()] = true;
			//在前端显示出来
			userElement = document.createElement("DIV");
			userElement.id = snapshot.key();
			userElement.className = "card";
			userElement.style.cssText = "margin: 5px 5px; font-size: 0.75em;";
			if (snapshot.key()==name){//当前用户
				userElement.innerHTML = "<p><strong class='green'>"+snapshot.key()+"</strong></p>";
			}
			else{//非当前用户
				userElement.innerHTML = "<p><strong class='blue'>"+snapshot.key()+"</strong></p>";
			}
			
			userList.append(userElement);
		});
		userlistRef.on("child_removed", function(snapshot){
			delete namelist[snapshot.key()];
			//从前端删除
			userList.children('#'+snapshot.key()).remove();
		});
		
		
		var unt = null;  //暂定用户名
		//要求输入用户名并审查是否合法
		while(true){
			unt = null;
			unt = prompt("欢迎来到聊天室，请输入你的名称：", "Guest");
			if (unt===null){//未输入用户名
				alert("请输入名称！");
			}
			else if(namelist[unt]!=undefined){//用户名已存在
				alert("该名称正在被使用，请更换一个");
			}
			else{//用户名合法
				break;
			}
		};
		name = unt;
		//上传用户名
		var ob = {};
		ob[unt] = true;
		userlistRef.update(ob);	
		
		//用户离线则注销
		var userRef = new Firebase('https://sizzling-torch-9606.firebaseio.com/userlist/'+name);
		userRef.onDisconnect().remove();
		
		//输入框上方显示用户名
		$('#messagebar').children().children()[0].innerHTML = name;
		//输入框点击Enter发送
		messageField.keypress(function (e) {
			if (e.keyCode == 13) {
				var message = messageField.val();
				//上传该消息
				messagesRef.push({name:name, text:message});
				messageField.val('');
			}
		});
		//实时更新消息列表（刚进入时显示最近4条消息）
		messagesRef.limitToLast(4).on('child_added', function (snapshot) {
			//获取消息
			var data = snapshot.val();
			var username = data.name;
			var message = data.text;
			//前端显示
			var messageElement = document.createElement("DIV");
			messageElement.className = "card";
			messageElement.style.cssText = "margin: 10px 5px; font-size: 0.75em;";
			if (name===username){//当前用户发送的消息
				messageElement.innerHTML = "<p><strong class='green'>"+username+"</strong>:</p><p>"+message+"</p>";
			}
			else{//其他用户发送的消息
				messageElement.innerHTML = "<p><strong class='blue'>"+username+"</strong>:</p><p>"+message+"</p>";
				}
			messageList.append(messageElement)

			//将消息列表自动维持在最底端
			messageList[0].scrollTop = messageList[0].scrollHeight;
		});
	}	