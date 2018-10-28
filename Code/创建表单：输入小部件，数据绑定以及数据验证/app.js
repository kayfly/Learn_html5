(function(){
    var init = function(){
        var orderForm = document.forms.order,
            saveBtn = document.getElementById('saveOrder'),
            saveBtnClicked = false;
        
        var saveForm = function(){
            if(!('formAction' in document.createElement('input'))){
                var formAction = saveBtn.getAttribute('formaction');
                orderForm.setAttribute('action', formAction);//手动设置表单的action属性
            }
            saveBtnClicked = true;
        };
        saveBtn.addEventListener('click', saveForm, false); 
        //开始构建计算器
        var qtyFields = orderForm.quantity,//购买数量
            totalFields = document.getElementsByClassName('item_total'),//单位商品价格总计
            orderTotalField = document.getElementById('order_total');//总价

        //格式化数字
        var formatMoney = function(value) {
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");//查找3*n个数字前面的非边界数字，以及后面不是1*n个数字的非单词边界，用“，”隔开
        }

        //计算每种产品的总金额以及整个订单的总金额
        var calculateTotals = function() {
            var i = 0,
            ln = qtyFields.length,
            itemQty = 0,
            itemTotal =0,
            itemPrice =0,
            itemTotalMoney ='$0.00',
            orderTotal =0,
            orderTotalMoney ='$0.00';

                   for(;i<ln;i++){
                       //取回quantity字段输入的值
                       if(!!qtyFields[i].valueAsNumber){//测试valueAsNumber属性的存在性。!!用于将valueAsNumber属性值强制转换成布尔类型，第一个!是对属性值转换为布尔值，但同时取了非，所以再加一个!。
                        itemQty = qtyFields[i].valueAsNumber || 0;
                       }
                       else{
                           itemQty = parseFloat(qtyFields[i].value) || 0;
                       }

                       //取回各产品的价值，计算单种产品价格值，以及总值
                       if(!!qtyFields[i].dataset) {
                        itemPrice =parseFloat(qtyFields[i].dataset.price);
                      } else {
                        itemPrice =parseFloat(qtyFields[i].getAttribute('data-price'));
                      }
                      // itemTotal =itemQty *itemprice;大小写！！！ 还有下面的式子，开始把+输成=了……醉了
                       itemTotal =itemQty *itemPrice;
                       itemTotalMoney = '$'+formatMoney(itemTotal.toFixed(2));
                       orderTotal +=itemTotal;
                       orderTotalMoney = '$'+formatMoney(orderTotal.toFixed(2));

                       //output元素，显示总金额
                       if(!!totalFields[i].value){
                           totalFields[i].value = itemTotalMoney;
                           orderTotalField.value = orderTotalMoney;
                       }else{
                        totalFields[i].innerHTML = itemTotalMoney;
                        orderTotalField.innerHTML = orderTotalMoney;
                       }
                   }
                };

                   calculateTotals();//执行初始计算，防止某个字段被预先填充。由于init函数在页面加载时被调用，将会访问到预填充数据

                   //事件监听器
                   var qtyListeners = function() {
                    var i = 0,
                        ln = qtyFields.length;
                    for(;i<ln;i++) {
                      qtyFields[i].addEventListener('input',calculateTotals, false);
                      qtyFields[i].addEventListener('keyup',calculateTotals, false);
                    }
                  };
                  qtyListeners();//创建完调用一次

                  //消息验证，为输入字段添加自定义验证与错误消息提示
                  var doCustomValidity = function(field, msg){
                    if('setCustomValidity' in field){
                        field.setCustomValidity(msg);
                    }else{
                        field.validationMessage = msg;
                    }
                };
                var validateForm = function() {
                    doCustomValidity(orderForm.name, '');
                    doCustomValidity(orderForm.password, '');
                    doCustomValidity(orderForm.confirm_password, '');
                    doCustomValidity(orderForm.card_name, '');
                
                    if(orderForm.name.value.length < 4){
                        doCustomValidity(
                            orderForm.name, '名字不能少于四个字符！'
                        );
                    }
                    if(orderForm.password.value.length < 8){
                        doCustomValidity(
                            orderForm.password, '密码不能低于8位'
                        );
                    }
                    if(orderForm.password.value != orderForm.confirm_password.value){
                        doCustomValidity(
                            orderForm.confirm_password, '请确认密码一致！'
                        );
                    }
                    if(orderForm.card_name.value.length < 4){
                        doCustomValidity(
                            orderForm.card_name, '卡名至少有四个字符！'
                        );
                    }
                }
  
    orderForm.addEventListener('input', validateForm, false);
    orderForm.addEventListener('keyup', validateForm, false);

    //利用invalidate事件来侦测失败的表单验证
    var styleInvalidForm = function(){
        orderForm.classname = 'invalid';//为<form>元素添加一个invalid类。下一步我们将用它样式化已提交表单中的无效字段
    }
    orderForm.addEventListener('invalida', styleInvalidForm, true);//侦测表单中的invalid事件以及其他所有事件
          Modernizr.load(
              {
                  test: Modernizr.inputtypes.month,
                  nope: 'monthpicker.js'//浏览器不支持mouth类型就加载外部js文件
              }
          );
//在safari5.1中阻止无效表单的提交
    var getFieldLabel = function(field){
        if('labels' in field && field.labels > 0){
            return field.labels[0].innerHTML;
        }
        if(field.parseNode && field.parentNode.tagName.toLowerCase() === 'label'){
            return field.parentNode.innerHTML;
        }
        return '';
    }

    var submitForm = function(e){
        if(!saveBtnClicked){
            validateForm();
            var i = 0,
            ln = orderForm.length,
            field,
            errors = [],
            errorFields = [],
            errorMsg = '';

            for (; i<ln; i++){
                field = orderForm[i];
                if((!!field.validationMessage && field.validationMessage.length>0) || (!!field.checkValidity && !field.checkValidity()))
                {
                  errors.push(
                      getFieldLabel(field)+': '+field.validationMessage
                  );
                  errorFields.push(field);

                }
            
            }
            if(errors.length>0){
                e.preventDefault();

                errorMsg = errors.join('\n');

                alert('请注意下面的问题:\n'+errorMsg, 'error');
                errorFields[0].focus();
            }
        }
    }
    orderForm.addEventListener('submit', submitForm, false);
    //针对ie9的验证回退方案
    var fallbackValidation = function() {
        var i = 0,
            ln = orderForm.length,
            field;
        for(;i<ln;i++) {
          field = orderForm[i];
          doCustomValidity(field, '');
          if(field.hasAttribute('pattern')) {
            var pattern = new  RegExp(field.getAttribute('pattern').toString());
            if(!pattern.test(field.value)) {
              var msg = 'Please match the requested format.';
              if(field.hasAttribute('title') &&  field.getAttribute('title').length > 0) {
                msg += ' '+field.getAttribute('title');
              }
              doCustomValidity(field, msg);
            }
          }
          if(field.hasAttribute('type') &&
             field.getAttribute('type').toLowerCase()=== 'email') {
            var pattern = new RegExp(/\S+@\S+\.\S+/);
            if(!pattern.test(field.value)) {
              doCustomValidity(field, 'Please enter an email address.');
            }
          }
          if(field.hasAttribute('required') && field.value.length < 1) {
            doCustomValidity(field, 'Please fill out this field.');
          }
        }
      };
  
  
    };
    window.addEventListener('load',init, false);


})();