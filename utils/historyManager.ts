
import { Transaction } from '../types';

const STORAGE_KEY = 'hdfc_history_v2';
const OFFLINE_QUEUE_KEY = 'hdfc_offline_queue';

// Raw data provided for seeding
const RAW_SEED_DATA = [
    {
      date: "2025-11-21",
      time: "12:11 AM",
      paidTo: "UNIPIN",
      paidToUPIId: "unipin.cf@axisbank",
      amount: 8202.0,
      upiRefId: "TXN3892404342",
      utrNumber: "UTR342959557779",
  }, {
      date: "2025-11-21",
      time: "07:39 PM",
      paidTo: "ARIF SON OF VARISH",
      paidToUPIId: "99107415@axl",
      amount: 3500.0,
      upiRefId: "TXN3941339484",
      utrNumber: "UTR825706949638",
  }, {
      date: "2025-11-21",
      time: "08:03 PM",
      paidTo: "SAWAIKUMAR MAHESHWARI",
      paidToUPIId: "8485964271s@kotak",
      amount: 720.0,
      upiRefId: "TXN4471429608",
      utrNumber: "UTR480559921561",
  }, {
      date: "2025-11-21",
      time: "08:21 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr10j571cqm6@paytm",
      amount: 340.0,
      upiRefId: "TXN1026909929",
      utrNumber: "UTR277644670443",
  }, {
      date: "2025-11-21",
      time: "09:02 PM",
      paidTo: "Harsh Prajapati",
      paidToUPIId: "harshprajapati0020@oksbi",
      amount: 1030.0,
      upiRefId: "TXN4079632157",
      utrNumber: "UTR197624878916",
  }, {
      date: "2025-11-21",
      time: "10:23 PM",
      paidTo: "Bhumi Gohil",
      paidToUPIId: "bhumi.meet1828@okaxis",
      amount: 25000.0,
      upiRefId: "TXN9594118573",
      utrNumber: "UTR758812490639",
  }, {
      date: "2025-11-21",
      time: "11:13 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 840.0,
      upiRefId: "TXN1104072842",
      utrNumber: "UTR896040125068",
  }, {
      date: "2025-11-22",
      time: "07:42 AM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr6k1woo@ptys",
      amount: 70.0,
      upiRefId: "TXN6273318176",
      utrNumber: "UTR788936651267",
  }, {
      date: "2025-11-22",
      time: "07:53 AM",
      paidTo: "Vasava Narendrakumar Balubhai",
      paidToUPIId: "9316857281@ptaxis",
      amount: 120.0,
      upiRefId: "TXN1073475989",
      utrNumber: "UTR958103788014",
  }, {
      date: "2025-11-22",
      time: "08:10 AM",
      paidTo: "Sidhirt Jana",
      paidToUPIId: "sidhirtjana604@oksbi",
      amount: 200.0,
      upiRefId: "TXN9473811009",
      utrNumber: "UTR153534907359",
  }, {
      date: "2025-11-22",
      time: "10:44 AM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr68ko7j@ptys",
      amount: 300.0,
      upiRefId: "TXN5159281194",
      utrNumber: "UTR882366396923",
  }, {
      date: "2025-11-22",
      time: "11:02 AM",
      paidTo: "Google Pay Merchant",
      paidToUPIId: "gpay-11257083339@okbizaxis",
      amount: 3000.0,
      upiRefId: "TXN6419079685",
      utrNumber: "UTR662039927493",
  }, {
      date: "2025-11-22",
      time: "11:10 AM",
      paidTo: "Rudra Pratap Singh",
      paidToUPIId: "9537596895-3@ibl",
      amount: 3000.0,
      upiRefId: "TXN3914178528",
      utrNumber: "UTR984291294002",
  }, {
      date: "2025-11-22",
      time: "11:15 AM",
      paidTo: "ANJU GOYAL",
      paidToUPIId: "9327833106@ptaxis",
      amount: 10.0,
      upiRefId: "TXN5494755990",
      utrNumber: "UTR581929336022",
  }, {
      date: "2025-11-22",
      time: "11:15 AM",
      paidTo: "A4 APPLE MOBILES",
      paidToUPIId: "bhqr.2984865A@sib",
      amount: 100.0,
      upiRefId: "TXN8774586947",
      utrNumber: "UTR779732194950",
  }, {
      date: "2025-11-22",
      time: "11:22 AM",
      paidTo: "A4 APPLE MOBILES",
      paidToUPIId: "a4applemob@sbi",
      amount: 3000.0,
      upiRefId: "TXN2988294016",
      utrNumber: "UTR20819760794",
  }, {
      date: "2025-11-22",
      time: "11:41 AM",
      paidTo: "M/S.ASHOK SONS",
      paidToUPIId: "eazypay.2000004390@icici",
      amount: 2140.0,
      upiRefId: "TXN9756906614",
      utrNumber: "UTR948948784632",
  }, {
      date: "2025-11-22",
      time: "12:11 PM",
      paidTo: "vanraj51093",
      paidToUPIId: "vanraj51093@okhdfcbank",
      amount: 400.0,
      upiRefId: "TXN7899205503",
      utrNumber: "UTR152225976681",
  }, {
      date: "2025-11-22",
      time: "01:03 PM",
      paidTo: "ARIF",
      paidToUPIId: "9910374154-2@ibl",
      amount: 10.0,
      upiRefId: "TXN2875465779",
      utrNumber: "UTR678989447964",
  }, {
      date: "2025-11-22",
      time: "10:50 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 1240.0,
      upiRefId: "TXN6850712325",
      utrNumber: "UTR329683581781",
  }, {
      date: "2025-11-22",
      time: "10:56 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytm.s1kn1x5@pty",
      amount: 40.0,
      upiRefId: "TXN2232793022",
      utrNumber: "UTR297814325680",
  }, {
      date: "2025-11-23",
      time: "02:48 AM",
      paidTo: "Indian Oil Petroleum",
      paidToUPIId: "paytmqr26482g37@paytm",
      amount: 2500.0,
      upiRefId: "TXN38885932",
      utrNumber: "UTR186363704612",
  }, {
      date: "2025-11-23",
      time: "03:16 AM",
      paidTo: "COURTYARD BY MARRIOTT",
      paidToUPIId: "079056008710120.bqr@kotak",
      amount: 588.82,
      upiRefId: "TXN1257173815",
      utrNumber: "UTR962618926995",
  }, {
      date: "2025-11-23",
      time: "04:08 AM",
      paidTo: "Juned Motorwala",
      paidToUPIId: "junedmotorwala-1@okicici",
      amount: 200.0,
      upiRefId: "TXN452472962",
      utrNumber: "UTR570750762445",
  }, {
      date: "2025-11-23",
      time: "04:19 AM",
      paidTo: "Sanjay Mevawala",
      paidToUPIId: "sanjaymevawala136@okaxis",
      amount: 340.0,
      upiRefId: "TXN7014316077",
      utrNumber: "UTR515357118969",
  }, {
      date: "2025-11-23",
      time: "05:47 AM",
      paidTo: "Google",
      paidToUPIId: "youtube@axisbank",
      amount: 3599.0,
      upiRefId: "TXN4191380437",
      utrNumber: "UTR232354678446",
  }, {
      date: "2025-11-23",
      time: "04:13 PM",
      paidTo: "RYAN FOUNDATION FOR NAT",
      paidToUPIId: "MAB.037326002300052@AXISBANK",
      amount: 125.0,
      upiRefId: "TXN3666245100",
      utrNumber: "UTR298957820541",
  }, {
      date: "2025-11-23",
      time: "05:56 PM",
      paidTo: "Harsh Ahir",
      paidToUPIId: "harshahir404040@okicici",
      amount: 1500.0,
      upiRefId: "TXN1573314530",
      utrNumber: "UTR716823684184",
  }, {
      date: "2025-11-23",
      time: "06:18 PM",
      paidTo: "Chirag Rathod",
      paidToUPIId: "chiragrathod17@okaxis",
      amount: 490.0,
      upiRefId: "TXN8246864498",
      utrNumber: "UTR59263201283",
  }, {
      date: "2025-11-23",
      time: "07:17 PM",
      paidTo: "Jeet Parmar",
      paidToUPIId: "jeetparmar844@okicici",
      amount: 1500.0,
      upiRefId: "TXN6947251728",
      utrNumber: "UTR546345753232",
  }, {
      date: "2025-11-23",
      time: "07:29 PM",
      paidTo: "Default",
      paidToUPIId: "vyapar.170914872771@hdfcbank",
      amount: 300.0,
      upiRefId: "TXN5901723857",
      utrNumber: "UTR23505438969",
  }, {
      date: "2025-11-23",
      time: "07:58 PM",
      paidTo: "BOBNCR ICCW",
      paidToUPIId: "bobncr@barodampay",
      amount: 5000.0,
      upiRefId: "TXN7870774919",
      utrNumber: "UTR315225167862",
  }, {
      date: "2025-11-23",
      time: "08:00 PM",
      paidTo: "PhonePeMerchant",
      paidToUPIId: "Q810851347@ybl",
      amount: 10.0,
      upiRefId: "TXN2649318345",
      utrNumber: "UTR707698207364",
  }, {
      date: "2025-11-23",
      time: "08:07 PM",
      paidTo: "Talib Khan",
      paidToUPIId: "tk634268-2@okhdfcbank",
      amount: 1.0,
      upiRefId: "TXN5847012449",
      utrNumber: "UTR457371440072",
  }, {
      date: "2025-11-23",
      time: "08:27 PM",
      paidTo: "RAMAWAT GOURAV DWARKADAS",
      paidToUPIId: "8619495616@ybl",
      amount: 650.0,
      upiRefId: "TXN5672506409",
      utrNumber: "UTR553614373806",
  }, {
      date: "2025-11-24",
      time: "02:56 AM",
      paidTo: "COURTYARD BY MARRIOTT",
      paidToUPIId: "079056008710120.bqr@kotak",
      amount: 1532.82,
      upiRefId: "TXN5848346976",
      utrNumber: "UTR535036929473",
  }, {
      date: "2025-11-24",
      time: "03:44 AM",
      paidTo: "VINOD KUMAR K",
      paidToUPIId: "6354359689@ptyes",
      amount: 550.0,
      upiRefId: "TXN2820408350",
      utrNumber: "UTR663313949327",
  }, {
      date: "2025-11-24",
      time: "04:15 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr5hcd61@ptys",
      amount: 810.0,
      upiRefId: "TXN3055266276",
      utrNumber: "UTR554463416296",
  }, {
      date: "2025-11-24",
      time: "04:42 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr6pk3y7@ptys",
      amount: 340.0,
      upiRefId: "TXN1747492116",
      utrNumber: "UTR897096546004",
  }, {
      date: "2025-11-24",
      time: "07:14 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 250.0,
      upiRefId: "TXN8863964471",
      utrNumber: "UTR557457530741",
  }, {
      date: "2025-11-24",
      time: "07:33 PM",
      paidTo: "Esha Khatri",
      paidToUPIId: "eshakhatri0@okhdfcbank",
      amount: 280.0,
      upiRefId: "TXN7516344317",
      utrNumber: "UTR183871505624",
  }, {
      date: "2025-11-24",
      time: "08:34 PM",
      paidTo: "Nayan Mohite",
      paidToUPIId: "nayanmohite9@okhdfcbank",
      amount: 65.0,
      upiRefId: "TXN3587392839",
      utrNumber: "UTR249037170638",
  }, {
      date: "2025-11-24",
      time: "09:13 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 940.0,
      upiRefId: "TXN8595383064",
      utrNumber: "UTR787995176647",
  }, {
      date: "2025-11-24",
      time: "10:53 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 750.0,
      upiRefId: "TXN4996497455",
      utrNumber: "UTR731257380336",
  }, {
      date: "2025-11-24",
      time: "10:57 PM",
      paidTo: "PhonePeMerchant",
      paidToUPIId: "Q978579321@ybl",
      amount: 340.0,
      upiRefId: "TXN8855385251",
      utrNumber: "UTR434291500976",
  }, {
      date: "2025-11-25",
      time: "04:55 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 250.0,
      upiRefId: "TXN6769843697",
      utrNumber: "UTR858437793220",
  }, {
      date: "2025-11-25",
      time: "08:47 PM",
      paidTo: "Samrat Samrat",
      paidToUPIId: "9638265929@fam",
      amount: 600.0,
      upiRefId: "TXN3240323746",
      utrNumber: "UTR459323272034",
  }, {
      date: "2025-11-25",
      time: "10:53 PM",
      paidTo: "ADHYA ENTERPRISES",
      paidToUPIId: "paytm-63307999@ptys",
      amount: 975.0,
      upiRefId: "TXN6310938766",
      utrNumber: "UTR545508605997",
  }, {
      date: "2025-11-25",
      time: "11:18 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytm.s1syj13@ptys",
      amount: 600.0,
      upiRefId: "TXN7190619722",
      utrNumber: "UTR850736788453",
  }, {
      date: "2025-11-25",
      time: "11:52 PM",
      paidTo: "GANESH PAN",
      paidToUPIId: "9726787111@okbizaxis",
      amount: 160.0,
      upiRefId: "TXN2485908392",
      utrNumber: "UTR786981640759",
  }, {
      date: "2025-11-26",
      time: "03:22 AM",
      paidTo: "Bhumik Patel",
      paidToUPIId: "bhumik.patel212@okhdfcbank",
      amount: 180.0,
      upiRefId: "TXN1616301986",
      utrNumber: "UTR496900946800",
  }, {
      date: "2025-11-26",
      time: "06:57 AM",
      paidTo: "PhonePeMerchant",
      paidToUPIId: "Q286336363@ybl",
      amount: 340.0,
      upiRefId: "TXN6061530381",
      utrNumber: "UTR76924873981",
  }, {
      date: "2025-11-26",
      time: "07:55 AM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr6fhttu@ptys",
      amount: 100.0,
      upiRefId: "TXN9094299885",
      utrNumber: "UTR107858031248",
  }, {
      date: "2025-11-26",
      time: "03:58 PM",
      paidTo: "Ravi Mehta",
      paidToUPIId: "ravimehta22887-2@okicici",
      amount: 15500.0,
      upiRefId: "TXN9165740776",
      utrNumber: "UTR466692112537",
  }, {
      date: "2025-11-26",
      time: "06:03 PM",
      paidTo: "Prince Adwani",
      paidToUPIId: "8780406864@pthdfc",
      amount: 3900.0,
      upiRefId: "TXN7322375159",
      utrNumber: "UTR588102958733",
  }, {
      date: "2025-11-26",
      time: "06:47 PM",
      paidTo: "Mann Katariya",
      paidToUPIId: "mansukh90906-1@okhdfcbank",
      amount: 50.0,
      upiRefId: "TXN2616358047",
      utrNumber: "UTR270775757598",
  }, {
      date: "2025-11-26",
      time: "08:08 PM",
      paidTo: "Jay Gajera",
      paidToUPIId: "jay.jk.patel-1@okhdfcbank",
      amount: 80.0,
      upiRefId: "TXN692037608",
      utrNumber: "UTR546268444295",
  }, {
      date: "2025-11-26",
      time: "08:32 PM",
      paidTo: "Unknown",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 510.0,
      upiRefId: "TXN751094219",
      utrNumber: "UTR779970897410",
  }, {
      date: "2025-11-26",
      time: "08:36 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 510.0,
      upiRefId: "TXN8813819572",
      utrNumber: "UTR783180113235",
  }, {
      date: "2025-11-26",
      time: "10:35 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 370.0,
      upiRefId: "TXN9528636300",
      utrNumber: "UTR412672906778",
  }, {
      date: "2025-11-26",
      time: "10:50 PM",
      paidTo: "SHEKH NAJARALI",
      paidToUPIId: "9586777700@kotak811",
      amount: 340.0,
      upiRefId: "TXN8987366902",
      utrNumber: "UTR604089418440",
  }, {
      date: "2025-11-27",
      time: "08:51 PM",
      paidTo: "SUKOON",
      paidToUPIId: "sukoon.63983079@hdfcbank",
      amount: 1930.0,
      upiRefId: "TXN8451857076",
      utrNumber: "UTR100060209994",
  }, {
      date: "2025-11-27",
      time: "10:34 PM",
      paidTo: "Paytm",
      paidToUPIId: "paytmqr5d3r57@ptys",
      amount: 220.0,
      upiRefId: "TXN249924013",
      utrNumber: "UTR483486923220",
  }, {
      date: "2025-11-28",
      time: "10:53 AM",
      paidTo: "Paytm",
      paidToUPIId: "paytm.s1iuzso@pty",
      amount: 50.0,
      upiRefId: "TXN7863348162",
      utrNumber: "UTR762362485525",
  }, {
      date: "2025-11-28",
      time: "11:05 AM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 490.0,
      upiRefId: "TXN6260448192",
      utrNumber: "UTR477602141771",
  }, {
      date: "2025-11-28",
      time: "01:41 PM",
      paidTo: "M/S.DHYEY PSYCHE CARE",
      paidToUPIId: "eazypay.2000004569@icici",
      amount: 5000.0,
      upiRefId: "TXN7234170363",
      utrNumber: "UTR157630691113",
  }, {
      date: "2025-11-28",
      time: "02:04 PM",
      paidTo: "M/S.LIVESTREAM COFFEE LLP",
      paidToUPIId: "ibkPOS.EP165295@icici",
      amount: 240.0,
      upiRefId: "TXN6793541932",
      utrNumber: "UTR117580408880",
  }, {
      date: "2025-11-28",
      time: "08:29 PM",
      paidTo: "COURTYARD BY MARRIOTT",
      paidToUPIId: "9726889218@ybl",
      amount: 1237.82,
      upiRefId: "TXN9250523091",
      utrNumber: "UTR411784968536",
  }, {
      date: "2025-11-28",
      time: "09:16 PM",
      paidTo: "COURTYARD BY MARRIOTT",
      paidToUPIId: "9726889218@ybl",
      amount: 767.0,
      upiRefId: "TXN6058980313",
      utrNumber: "UTR947262458428",
  }, {
      date: "2025-11-28",
      time: "10:56 PM",
      paidTo: "Paytm",
      paidToUPIId: "9825424911@paytm",
      amount: 1139.0,
      upiRefId: "TXN5694205469",
      utrNumber: "UTR5694205469",
  }, {
      date: "2025-11-28",
      time: "11:10 PM",
      paidTo: "Paytm",
      paidToUPIId: "9825424911@paytm",
      amount: 340.0,
      upiRefId: "TXN1541094035",
      utrNumber: "UTR1541094035",
  }, {
      date: "2025-11-29",
      time: "03:28 AM",
      paidTo: "HARDCASTLE RESTAURAN",
      paidToUPIId: "9726703080@ybl",
      amount: 359.01,
      upiRefId: "TXN3529329774",
      utrNumber: "UTR310328514120",
  }, {
      date: "2025-11-29",
      time: "03:58 AM",
      paidTo: "SURAT MARRIOTT HOTEL",
      paidToUPIId: "9726703080@ybl",
      amount: 420.0,
      upiRefId: "TXN3122754641",
      utrNumber: "UTR310358641974",
  }, {
      date: "2025-11-29",
      time: "04:17 AM",
      paidTo: "MARRIOTT SURAT",
      paidToUPIId: "9726703080@ybl",
      amount: 466.1,
      upiRefId: "TXN3836791624",
      utrNumber: "UTR310417578274",
  }, {
      date: "2025-11-22",
      time: "10:00 AM",
      paidTo: "Aashirvad TECHNOLOGIES PVT LTD",
      paidToUPIId: "manishchoudary@okicici",
      amount: 18000,
      upiRefId: "TXN4873928475",
      utrNumber: "UTR487392847512",
      type: "credit"
  }, {
      date: "2025-11-24",
      time: "02:00 PM",
      paidTo: "RAHUL SHARMA",
      paidToUPIId: "rahulsharma@oksbi",
      amount: 5000,
      upiRefId: "TXN1928374650",
      utrNumber: "UTR192837465019",
      type: "credit"
  }, {
      date: "2025-11-25",
      time: "09:00 AM",
      paidTo: "AMAZON INDIA",
      paidToUPIId: "refund.amazon@axisbank",
      amount: 2500,
      upiRefId: "TXN7564839201",
      utrNumber: "UTR756483920175",
      type: "credit"
  }, {
      date: "2025-11-26",
      time: "11:30 AM",
      paidTo: "Riya VijayVargiya",
      paidToUPIId: "riyavijayvargiya@okhdfcbank",
      amount: 15000,
      upiRefId: "TXN3647285910",
      utrNumber: "UTR364728591036",
      type: "credit"
  }, {
      date: "2025-11-27",
      time: "04:00 PM",
      paidTo: "Ajay Mehta",
      paidToUPIId: "ajaymehta@okaxis",
      amount: 10000,
      upiRefId: "TXN8192736457",
      utrNumber: "UTR819273645781",
      type: "credit"
  }, {
      date: "2025-11-28",
      time: "01:00 PM",
      paidTo: "ATM CASH DEPOSIT",
      paidToUPIId: "hdfcncr@hdfcbank",
      amount: 3000,
      upiRefId: "TXN4758392016",
      utrNumber: "UTR475839201647",
      type: "credit"
  }, {
      date: "2025-11-29",
      time: "08:00 AM",
      paidTo: "Ashok Leyland Ltd",
      paidToUPIId: "ashokleyland@okicici",
      amount: 7500,
      upiRefId: "TXN6283947512",
      utrNumber: "UTR628394751262",
      type: "credit"
  } 
];

const parseSeedDate = (dateStr: string, timeStr: string): string => {
  try {
    // Robust parsing for "YYYY-MM-DD" and "HH:MM AM/PM"
    // dateStr: "2025-11-21"
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    
    // timeStr: "12:11 AM" or "07:39 PM"
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(num => parseInt(num, 10));

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    // Create date object (Month is 0-indexed in JS Date)
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.toISOString();
  } catch(e) {
    console.error("Error parsing date:", dateStr, timeStr, e);
    // Return current date as fallback, but this path should ideally not be reached with valid data
    return new Date().toISOString();
  }
};

const SEED_TRANSACTIONS: Transaction[] = RAW_SEED_DATA.map(item => ({
  id: "TX_" + Math.random().toString(36).substr(2, 9),
  pa: item.paidToUPIId,
  pn: item.paidTo,
  am: item.amount.toString(),
  tn: null,
  date: parseSeedDate(item.date, item.time),
  status: 'SUCCESS',
  utr: item.utrNumber,
  txnRef: item.upiRefId,
  type: (item as any).type === 'credit' ? 'CREDIT' : 'DEBIT'
}));

// Sort by date descending
SEED_TRANSACTIONS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const getHistory = (): Transaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const offlineStored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    
    let history: Transaction[] = [];
    let offlineQueue: Transaction[] = [];

    if (stored) {
      history = JSON.parse(stored);
    } else {
      // Seed if empty (existing logic)
      history = SEED_TRANSACTIONS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }

    if (offlineStored) {
      offlineQueue = JSON.parse(offlineStored);
    }

    // Merge: Offline queue usually contains recent items.
    const combined = [...offlineQueue, ...history];
    // Sort descending
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return combined;
  } catch (e) {
    console.error("Failed to load history", e);
    return SEED_TRANSACTIONS;
  }
};

export const saveTransaction = (tx: Transaction) => {
  try {
    if (!navigator.onLine) {
       // Offline Mode - Save to Queue
       const offlineStored = localStorage.getItem(OFFLINE_QUEUE_KEY);
       const queue: Transaction[] = offlineStored ? JSON.parse(offlineStored) : [];
       
       const offlineTx = { ...tx, isOffline: true };
       const newQueue = [offlineTx, ...queue];
       
       localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(newQueue));
    } else {
       // Online Mode - Save to Main History
       const stored = localStorage.getItem(STORAGE_KEY);
       const history: Transaction[] = stored ? JSON.parse(stored) : SEED_TRANSACTIONS;
       const newHistory = [tx, ...history];
       localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    }
    // Notify UI to update
    window.dispatchEvent(new Event('transaction_updated'));
  } catch (e) {
    console.error("Failed to save transaction", e);
  }
};

export const syncOfflineTransactions = () => {
  try {
    const offlineStored = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!offlineStored) return 0;

    const queue: Transaction[] = JSON.parse(offlineStored);
    if (queue.length === 0) return 0;

    const stored = localStorage.getItem(STORAGE_KEY);
    let history: Transaction[] = stored ? JSON.parse(stored) : SEED_TRANSACTIONS;

    // Mark as synced (remove isOffline flag)
    const syncedQueue = queue.map(tx => {
        const { isOffline, ...rest } = tx;
        return rest as Transaction;
    });

    history = [...syncedQueue, ...history];
    
    // Sort
    history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
    
    // Notify UI to update
    window.dispatchEvent(new Event('transaction_updated'));

    return queue.length;
  } catch (e) {
    console.error("Sync failed", e);
    return 0;
  }
};

export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Helper to get unique recent payees for the Home screen
export const getRecentPayees = () => {
  const history = getHistory();
  const uniquePayees = new Map();
  const colors = [
    "bg-red-100 text-red-600",
    "bg-green-100 text-green-600",
    "bg-blue-100 text-blue-600",
    "bg-yellow-100 text-yellow-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
    "bg-indigo-100 text-indigo-600",
    "bg-orange-100 text-orange-600"
  ];

  let colorIndex = 0;

  history.forEach((tx) => {
    // Only suggest payees we sent money to (DEBIT) or untyped (legacy default)
    if (tx.type && tx.type === 'CREDIT') return;

    const key = tx.pa; // Use VPA as unique key
    if (!uniquePayees.has(key)) {
      uniquePayees.set(key, {
        id: key,
        name: tx.pn || tx.pa,
        color: colors[colorIndex % colors.length] // Cycle through colors
      });
      colorIndex++;
    }
  });

  return Array.from(uniquePayees.values()).slice(0, 8); // Return top 8 recent
};