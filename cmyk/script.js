$(".button").on("click", function () {
  $("." + $(this).attr("data-layer")).toggleClass("is-hidden");
  $(this).toggleClass("is-active");
});
$(".blend").on("click", function () {
  $(".svg-container").toggleClass("is-mixed");
});

$(".smallify").on("click", function () {
  $(".eyeball").toggleClass("is-small");
});
