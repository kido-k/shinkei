

const CLICK_INTERVAL = 3000;

function ai_control(mark_num) {
  setTimeout(function () { select_card(mark_num) }, CLICK_INTERVAL);

}

function select_card(mark_num) {
  const mark = Math.floor( Math.random() * mark_num+1 );
  const card_num = Math.floor( Math.random() * (mark_num*13)+1 );  
  const card_id = mark + getdoubleDigestNumer(card_num);
  $('#' + card_id).click();
}

function controlLayout() {

}

function setInitialCard() {

};




function getdoubleDigestNumer(number) {
  return ("0" + number).slice(-2);
};
