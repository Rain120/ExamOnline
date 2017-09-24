$(document).ready(function(){
	toggleItem();
	$(".alter-password").click(function(){
		$(".alter-password-frame").css("display","block");
	});
});

function toggleItem(){
	$(".menu-btn").click(function(){
		$("#l-aside").toggle();
	});
	$(".items").click(function(){
		console.log($(this).index());
		$(this).nextAll("dd").toggle();
	});
}