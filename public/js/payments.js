let amountInput = document.getElementById("amount");
const digits_only = string => [...string].every(c => '0123456789'.includes(c));

function payWithPaystack() {
    let amountInput = document.getElementById("naira-amount");
    let amount = amountInput.value;
    if (!digits_only(amount) || amount.length < 2) {
        iziToast.warning({
            title: 'Warning!',
            message: 'Invalid amount',
            position: 'bottomRight'
        });
    } else {
        let email = document.getElementById("user_email").value;
        let phone = document.getElementById('user_phone').value;
        let name = document.getElementById('user_name').value;
        var handler = PaystackPop.setup({
            key: 'pk_test_0c79398dba746ce329d163885dd3fe5bc7e1f243',
            email: email,
            amount: amount * 100, //multiply amount by 100 to get kobo equivalent
            currency: "NGN",
            metadata: {
                custom_fields: [
                    {
                        display_name: "Mobile Number",
                        variable_name: "mobile_number",
                        value: phone
                    },
                    {
                        display_name: "Customer Email",
                        variable_name: "Email",
                        value: email
                    },
                    {
                        display_name: "Customer Name",
                        variable_name: "Name",
                        value: name
                    }
            ]
            },
            callback: function (response) {
                console.log(response);
                let reference = response.reference;
                $.ajax({
                    type: 'POST',
                    url: '/fundwallet',
                    data: {
                        email: email,
                        amount: amount,
                        reference: reference,
                        channel: "PAYSTACK",
                        payment_category: "Fund Naira Wallet",
                        currency: "NGN"
                    },
                    success: function(data) {
                        if (data.status == true) {
                            iziToast.success({
                                title: 'Success!',
                                message: 'Wallet funded successfully',
                                position: 'bottomRight'
                            });
                            setTimeout(function () {
                                window.location=window.location;
                            }, 5000); 
                        } else {
                            iziToast.error({
                                title: 'Error!',
                                message: 'Something went wrong',
                                position: 'bottomRight'
                            });    
                        }
                    },
                    error: function () {
                        iziToast.error({
                            title: 'Error!',
                            message: 'Something went wrong',
                            position: 'bottomRight'
                        });
                    }
                });
            },
            onClose: function () {
                iziToast.warning({
                    title: 'Warning!',
                    message: 'Payment closed',
                    position: 'bottomRight'
                });
            }
        });
        handler.openIframe();
    }
}

function payWithCryptos() {
    let amountInput = document.getElementById("usd-amount");
    let amount = amountInput.value;
    if (!digits_only(amount) || amount.length < 2) {
        iziToast.warning({
            title: 'Warning!',
            message: 'Invalid amount',
            position: 'bottomRight'
        });
    } else {
        let email = document.getElementById("user_email").value;
        let phone = document.getElementById('user_phone').value;
        let name = document.getElementById('user_name').value;
        let id = document.getElementById('user_id').value;
        paylot({
            amount: amount,
            key: 'pyt_pk-bacba9e97c3d434aa2bf177af7eccfa4',
            reference: 'T-'+Date.now() + '' + Math.floor((Math.random() * 1000000000) + 1),
            currency: 'USD',
            payload: {
                type: 'Fund Crypto Wallet',
                subject: 'Crypto Wallet Funding',
                name: name,
                userId: id,
                userPhone: phone,
                email: email,
                sendMail: true
            },
            onClose: function(){
                iziToast.warning({
                    title: 'Warning!',
                    message: 'PAYLOT CRYPTO channel closed',
                    position: 'bottomRight'
                });
            }
        }, (err, tx) => {
            console.log(tx);
            if(err){
                iziToast.warning({
                    title: 'Warning!',
                    message: 'PAYLOT CRYPTO channel encountered an error',
                    position: 'bottomRight'
                });
            }else{
                //Transaction was successful
                let reference = tx.reference;
                let amountPaid = tx.amount;
                const {destination, payload, realValue, confirmed} = tx
                $.ajax({
                    type: 'POST',
                    url: '/fundwallet',
                    data: {
                        email: email,
                        amount: amountPaid,
                        reference: reference,
                        channel: "PAYLOT CRYPTO"
                    },
                    success: function(data) {
                        if (data.status == true) {
                            iziToast.success({
                                title: 'Success!',
                                message: 'Wallet funded successfully',
                                position: 'bottomRight'
                            });
                            setTimeout(function () {
                                window.location=window.location;
                            }, 5000); 
                        } else {
                            iziToast.error({
                                title: 'Error!',
                                message: 'Something went wrong',
                                position: 'bottomRight'
                            });    
                        }
                    },
                    error: function () {
                        iziToast.error({
                            title: 'Error!',
                            message: 'Something went wrong',
                            position: 'bottomRight'
                        });
                    }
                });
            }
        });  
    }
}

function payWithCryptos2() {
    let amount = amountInput.value;
    if (!digits_only(amount) || amount.length < 2) {
        iziToast.warning({
            title: 'Warning!',
            message: 'Invalid amount',
            position: 'bottomRight'
        });
    } else {
        $.ajax({
            type: 'POST',
            url: '/createcheckout',
            data: {
                amount: amount,
            },
            success: function(data) {
                if (data.status == true) {
                    iziToast.success({
                        title: 'Success!',
                        message: "Processing checkout",
                        position: 'bottomRight'
                    });
                    //console.log(data);
                    setTimeout(function () {
                        window.location= data.url;
                    }, 5000); 
                    
                } else {
                    iziToast.error({
                        title: 'Error!',
                        message: data.message,
                        position: 'bottomRight'
                    });    
                }
            },
            error: function () {
                iziToast.error({
                    title: 'Error!',
                    message: 'Something went wrong',
                    position: 'bottomRight'
                });
            }
        });     
    }
}