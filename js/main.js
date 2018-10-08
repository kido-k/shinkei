
var cardlist = [];
var timer = "";
var marknum = 2;
var start = new Date();
var finish = false;
var click = 0;
var selected = '';

const back_card = 'img/z02.gif';
const blank_card = 'img/blank.gif';
const LOCALHOST80 = 'http://localhost:80/';
const LOCALHOST90 = 'http://localhost:90/';

const SHOWTIME = 300; //2枚目のカードをクリックしてから伏せるまでの時間
const CLICK_INTERVAL = 500;

const card_memory = [];

$(function () {
  var count = 0;
  var selected_card = "";

  $('#check').on('click', function () {
    loadRanking();
  });

  $('.exe').on('click', function () {
    if (this.id == 'game52' || this.id == 'ai52') {
      marknum = 4;
    }
    controlLayout();
    setInitialCard(marknum);
    displayCard();
    start = new Date();
    displayTime();
    if (this.id == 'ai26' || this.id == 'ai52') {
      ai_control(marknum);
    }
  });


  $(document).on('click', '.card', function () {
    if (selected_card != this.id) {
      var isDisplay = clickCard(this);
      if (isDisplay) {
        count += 1;
        displayCard();
        selected_card = this.id;
      } else {
        return;
      }
      if (count % 2 == 0) {
        judgeCard();
        setTimeout(displayCard, SHOWTIME);
        selected_card = "";
      }
    }
    judgeGameClear();
  });

  $('#send').on('click', function () {
    sendData();
    loadRanking();
  });
  $('#hide').on('click', function () {
    clearGame();
  });

  // $('#ai26').on('click', function () {
  //   select_card(marknum);
  // });
});

function sendData() {
  var data = [];
  var date = new Date();
  const today = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();

  if (marknum == 2) {
    data = [$('#name').val(), 0, $('#goaltime').text(), today];
  } else if (marknum == 4) {
    data = [$('#name').val(), 1, $('#goaltime').text(), today];
  } else { //動作チェック用
    data = [$('#name').val(), 0, '10分00秒', today];
  }
  $.ajax({
    url: LOCALHOST90 + 'result',
    type: 'GET',
    dataType: 'JSON',
    data: { 'data': data },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      // console.log(errorThrown + ' ajax通信に失敗しました');
    },
    success: function (res) {
      // console.log(' ajax通信に成功しました');
    }
  });
}

function loadRanking() {
  var gamemode = 0;
  if (marknum == 2) {
    gamemode = 0;
  } else if (marknum == 4) {
    gamemode = 1;
  } else { //動作チェック用
    gamemode = 0;
  }
  $('#rank').empty();
  $.ajax({
    url: LOCALHOST80 + 'rank',
    type: 'GET',
    dataType: 'JSON',
    data: { 'data': gamemode },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
      // console.log(errorThrown + ' ajax通信に失敗しました');
    },
    success: function (res) {
      // console.log('ajax通信に成功しました');
      // console.log(res);
      for (var i = 0; i < res.length; i++) {
        $('#rank').append(
          '<tr>'
          + '<td style="font-size:18px;padding:0 10px;">No.' + (i + 1) + '</td>'
          + '<td style="font-size:18px;padding:0 10px;border: #999 1px solid">' + res[i].name + '</td>'
          + '<td style="font-size:18px;padding:0 10px;border: #999 1px solid">' + res[i].time + '</td>'
          + '</tr>'
        );
      }
    }
  });
}

function controlLayout() {
  $(".toppage").css({ display: 'none' });
}

function setInitialCard(marknum) {
  cardlist = [];
  mark = { 0: 'c', 1: 'd', 2: 'h', 3: 's' };
  for (var i = 0; i < marknum; i++) {
    for (var n = 1; n < 14; n++) {
      var card = {
        card_id: mark[i] + getdoubleDigestNumer(n),
        show: false,
        display: true,
      }
      cardlist.push(card);
    }
  }
  cardlist = shufflecardlist(cardlist);
};

function displayTime() {
  now = new Date();

  datet = parseInt((now.getTime() - start.getTime()) / 1000);
  min = parseInt((datet / 60) % 60);
  sec = datet % 60;

  if (min < 10) { min = '0' + min; }
  if (sec < 10) { sec = '0' + sec; }

  timer = getdoubleDigestNumer(min) + '分'
    + getdoubleDigestNumer(sec) + '秒';

  $('#timer').html(timer);
  setTimeout('displayTime()', 1000);
}


function clickCard(card) {
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].card_id === card.id) {
      if (cardlist[i].display) {
        cardlist[i].show = true;
        return true;
      } else {
        return false;
      }
    }
  }
}

function judgeCard() {
  const showcard = [];
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].show) {
      showcard.push(i);
      cardlist[i].show = false;
    } else {
      cardlist[i].show = false;
    }
  }
  var first = cardlist[showcard[0]].card_id;
  var second = cardlist[showcard[1]].card_id;

  first = first.substring(1, 3);
  second = second.substring(1, 3);

  if (first == second) {
    cardlist[showcard[0]].display = false;
    cardlist[showcard[1]].display = false;
  }
}

function judgeGameClear() {
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].display) {
      break;
    }
    if (i + 1 == cardlist.length) {
      clearGame();
    }
  }
}

function clearGame() {
  finish = true;
  $(".game").css({ display: 'none' });
  $(".result").css({ display: 'inline-block' });
  $("#goaltime").html(timer);
  loadRanking();
  console.log("GameClear");
}

function displayCard() {
  const ext = '.gif';
  $('#bords').empty();
  const str = [];
  for (var i = 0; i < cardlist.length; i++) {
    const card = cardlist[i];
    if (card.show && card.display) {
      str.push('<img id="' + card.card_id + '" class="card" style="height:100px;width:66.66px;margin:5px;" src="img/' + card.card_id + ext + '">');
    } else if (!card.display) { //非表示のカード
      str.push('<img id="' + card.card_id + '" class="card" style="height:100px;width:66.66px;margin:5px;" src="' + blank_card + '">');
    } else { //伏せたカード
      str.push('<img id="' + card.card_id + '" class="card" style="height:100px;width:66.66px;margin:5px;" src="' + back_card + '">');
    }
  }
  const newstr = str.join('');
  $('#bords').append(newstr);
}

function shufflecardlist(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
};

function getdoubleDigestNumer(number) {
  return ("0" + number).slice(-2);
};


function ai_control(mark_num) {
  // select_card(mark_num);
  new_select_card(mark_num);
};

function select_card(mark_num) {
  const marks = { 0: 'c', 1: 'd', 2: 'h', 3: 's' };
  const m_num = Math.floor(Math.random() * mark_num);
  const card_num = Math.floor(Math.random() * 13) + 1;
  const card_id = marks[m_num] + getdoubleDigestNumer(card_num);
  card_memory.push(card_id);
  // console.log(card_memory);

  var clicked = false;
  if (!finish) {
    for (var i = 0; i < card_memory.length; i++) {
      const mark = card_memory[i].slice(0, 1);
      const num = card_memory[i].slice(-2);
      if (card_num == num && mark == 'c') {
        $('#d' + num).click();
        clicked = true;
      } else if ((card_num == num && mark == 'd')) {
        $('#c' + num).click();
        clicked = true;
      }
    }
    // console.log(card_id);
    if (!clicked) {
      $('#' + card_id).click();
    }
    setTimeout('select_card(' + mark_num + ')', CLICK_INTERVAL);
  }
};

function new_select_card() {
  // card_memory.push(card_id);
  // console.log(card_memory);
  var clicked = false;
  const select_cardlist = [];
  for (var i = 0; i < cardlist.length; i++) {
    if (cardlist[i].display == true) {
      select_cardlist.push(cardlist[i].card_id);
    }
  }

  const num = Math.floor(Math.random() * select_cardlist.length);
  const select_card_num = selected.slice(-2);
  const select_card_mark = selected.slice(0, 1);

  if (click % 2 == 1) {
    for (var n = 0; n < card_memory.length; n++) {
      if (select_card_num == card_memory[n].slice(-2) && select_card_mark == 'c') {
        $('#d' + select_card_num).click();
        click += 1;
        clicked = true;
        selected = select_cardlist[num];
        break;
      } else if ((select_card_num == card_memory[n].slice(-2) && select_card_mark == 'd')) {
        $('#c' + select_card_num).click();
        click += 1;
        clicked = true;
        selected = select_cardlist[num];
        break;
      }
    }
  }

  if (!clicked) {
    $('#' + select_cardlist[num]).click();
    card_memory.push(selected);
    click += 1;
    selected = select_cardlist[num];
  }

  if (!finish) {
    setTimeout(new_select_card, CLICK_INTERVAL);
  }
};