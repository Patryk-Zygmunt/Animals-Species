const https = require('https');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var Promise = require("bluebird");
const fs = require('fs');

parseData = async (neededInfoArr,animal) => {
    try {
        let obj = {Wikipedia: animal}
        console.log(animal)
        const parsed = await parseInfoBoxToArrayAndFindEng(animal);
        obj.eng = parsed.eng
        const rows = parsed.arr
        if (rows) {
            neededInfoArr.forEach(info => {
                let d = rows.filter(d => d.includes(info))[0]
                if (d) {
                    d = parseNames(d, info)
                }
                obj[info] = d
            });
        }
        return obj
    }catch (e) {
        console.log(e)
        
    }
}

async function parseInfoBoxToArrayAndFindEng(animal) {
    try {
        const dom = await JSDOM.fromURL("https://pl.wikipedia.org/wiki/" + animal)
        if (dom && dom.window.document.getElementsByClassName("infobox")[0]) {
            const rows = dom.window.document.getElementsByClassName("infobox")[0].rows
            const engName = parseEng(dom)
            return rows ?
                {arr:  Array.from(dom.window.document.getElementsByClassName("infobox")[0].rows).map(tr => tr.textContent).filter(d => d).map(d => d.replace(/(\r\n|\n|\r)/gm, "")), eng: engName}

                : {arr: [], eng: engName}
        }else{
            return []
        }
    }
    catch(e) {
        console.log(e)
    }
    }

    parseEng = (dom)=>{
        const engLinkClass = dom.window.document.getElementsByClassName("interlanguage-link interwiki-en")
        if(engLinkClass && engLinkClass[0] && engLinkClass[0].innerHTML) {
            const engLink = engLinkClass[0].innerHTML;
            return engLink.substring(engLink.lastIndexOf('title="') + 7, engLink.indexOf("ang") - 3)
        }
    }


    parseNames = (str, info) =>{
     let  s = str.replace(info, "")
      if(info === 'Gatunek' || info ===  'Podgatunek'){
          return s.toLowerCase()
              .split(' ').filter(d=>d)
              .map(function(word) {
                  return word[0].toUpperCase() + word.substr(1);
              })
              .join(' ');
      }
      return s;

    }


const animalsJsonArr = require('./animals-wiki').animals[0].a.a
const speciesArr = animalsJsonArr.map(d=>d.title)
const info = ["Podgatunek","Gatunek","Rodzaj","Rodzina","Rząd","Gromada","Królestwo"]


ff = async  () => {
    let result = []
    for (let i = 0; i < speciesArr.length; ++i) {
        let s = await  new Promise(resolve =>{
            setTimeout(async () => {
                let s = await parseData(info, speciesArr[i])
               resolve(s)
            }, (i % 500));
        }
        )
        result.push(s)

    }
    return result
}


ff()
    .then(v=>saveToFile("animals.json",JSON.stringify(v)))

// function delayMyPromise(myPromise) {
//     return Promise.delay(3000).then(function () {
//         return myPromise;
//     });
// }
//
//  Promise.all(speciesArr.map(a=>delayMyPromise(parseData(info,a))))
//     .then(v=>saveToFile("animals.json",JSON.stringify(v)))

saveToFile = (path,content)=>{
    fs.writeFileSync(path, content, function(err) {

        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });

}
