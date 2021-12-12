const Discord = require('discord.js');
const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/3279b22e535e44a49fd6bc8cf6240bb1"))
const client = new Discord.Client();
const fs = require("fs");
const bdd = require("./bdd.json");
const { channel } = require("diagnostics_channel");
const XLSX = require('xlsx')
let seuil;
client.on('ready', () => {
    console.log("go");
    seuil = bdd["seuil"]["niveau"];
    console.log("le seuil est " + seuil);
});

let passe = 0;
let mem;
const idserv = "317263352353128448";
const idrolewhitelist = "membre";
const idrolebest = "912793132729528330";
const idrolenul = "913858262888235068";
const idroleadmin = "owner";


client.on("message", async message => {
    let prefix = "!";
    let arg = message.content.trim().split(/ +/g)
    if (message.content.startsWith(prefix + "seuil")) {
        if (message.member.roles.cache.some(role => role.name === idroleadmin)) {
            try {
                let lol = parseFloat(arg[1]);
                if (!arg[1]) {
                    message.channel.send("Veuillez rentrer un seuil d'ETH");
                }
                else if (lol >= 0 && lol <= 100000 && typeof (lol) === "number") {
                    console.log(lol);
                    console.log(typeof (lol));
                    console.log("vf");
                    seuil = lol;
                    message.channel.send("Le seuil ETH a été changé à " + arg[1]);
                    bdd["seuil"] = { "niveau": lol }
                    Savebdd();
                }
                else {
                    console.log(lol);
                    console.log(typeof (lol));
                    message.channel.send("seuil invalide");
                }
            } catch (error) {
                message.channel.send("Le seuil est invalide");
            }
        }
    }
    else if (message.content.startsWith(prefix + "start")) {
        if (message.member.roles.cache.some(role => role.name === idroleadmin)) {
            let student = [];
       
            for (var nom_clee in bdd["liste"]) {
               
                scan(bdd["liste"][nom_clee]["adresse"], bdd["liste"][nom_clee]["pseudo"], bdd["liste"][nom_clee]["id"], message, 0);
                seuil = bdd["seuil"]["niveau"];
                if (bdd["liste"][nom_clee]["ETH"] < seuil) {
                    var list = client.guilds.cache.get(idserv);
                    list.members.cache.array().forEach(member => {
                        const roleName = member.roles.cache.find(r => r.name === idrolewhitelist)
                   
                      if (member.user.id == bdd["liste"][nom_clee]["id"]) {
                       
                        member.roles.add(idrolenul);
                        }
                     
                    });
                    message.channel.send(bdd["liste"][nom_clee]["pseudo"] + " n'a pas assez d'ETH (" + bdd["liste"][nom_clee]["ETH"] + "), il est retiré de la white list");
                    console.log(bdd["liste"][nom_clee]["pseudo"] + " n'a pas assez d'ETH (" + bdd["liste"][nom_clee]["ETH"] + ")");
                }
                else {
                    var list = client.guilds.cache.get(idserv);
                    list.members.cache.array().forEach(member => {
                        const roleName = member.roles.cache.find(r => r.name === idrolewhitelist)
                     
                      if (member.user.id == bdd["liste"][nom_clee]["id"]) {
                        
                        member.roles.add(idrolebest);
                        }
                     
                    });
                 
                    student.push({ name: bdd["liste"][nom_clee]["pseudo"], adresse: bdd["liste"][nom_clee]["adresse"], eth: bdd["liste"][nom_clee]["ETH"] })
                    message.channel.send(bdd["liste"][nom_clee]["pseudo"] + " a assez d'ETH (" + bdd["liste"][nom_clee]["ETH"] + ")");
                    console.log(bdd["liste"][nom_clee]["pseudo"] + " a assez d'ETH (" + bdd["liste"][nom_clee]["ETH"] + ")");
                }

            }
            const convertJsonToExcel = () => {

                const workSheet = XLSX.utils.json_to_sheet(student);
                const workBook = XLSX.utils.book_new();
            
                XLSX.utils.book_append_sheet(workBook, workSheet, "student")
                // Generate buffer
                XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" })
            
                // Binary string
                XLSX.write(workBook, { bookType: "xlsx", type: "binary" })
            
                XLSX.writeFile(workBook, "WhitelistOff.xlsx")
            
            }
            convertJsonToExcel()
        }
        message.channel.send("Testing message.", { files: ["./WhitelistOff.xlsx"] });
    }
   
    else if (message.content.startsWith(prefix + "wallet")) {
        if (message.member.roles.cache.some(role => role.name === idrolewhitelist)) {
        console.log("-------");
        if (!arg[1]) {
            return message.channel.send("Vous n'avez pas spécifié votre porte feuille");
        }
        else {
            if (arg[1].startsWith("0x") || arg[1].startsWith("yes")) {
                console.log("-1");
                ///////////////////////////////////
                if (bdd["liste"][message.author.id]) {
                    console.log("0");
                    console.log("passe : " + passe);

                    if (passe === 0) {
                        if (arg[1].startsWith("0x")) {
                            console.log("1");
                            message.channel.send("Vous avez deja enregistrez une adresse de portefeuille : " + bdd["liste"][message.author.id]["adresse"] + ", voulez vous la remplacer par " + arg[1] + " ? (tapez !wallet yes)");
                            passe = 1;
                            console.log("passe : " + passe);
                            mem = arg[1];
                        }
                    }
                    else if (passe === 1) {
                        passe = 0;
                        console.log("2");
                        if (message.content.startsWith(prefix + "wallet")) {
                            console.log("3");
                            if (!arg[1]) {
                                message.channel.send("Vous n'avez rien spécifié, l'ajout de la nouvel adresse est annulé");
                            }
                            else if (arg[1] === "yes") {
                                console.log("4");
                                scan(mem, message.author.username, message.author.id, message, 1);
                            }
                        }
                    }
                }
                else {
               
                    scan(arg[1], message.author.username, message.author.id, message, 1);
            }
            }
            else {
                message.channel.send("Le portefeuille n'est pas valide");
            }
        }
        console.log("OFFF passe : " + passe);
        }
    }
    else{
      
    }
    

  

})

function scan(portefeuille, nom, idd, ll, a) {
    try {
        web3.eth.getBalance(portefeuille, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(web3.utils.fromWei(result, "ether") + " ETH");
                let iiii = web3.utils.fromWei(result, "ether")
                console.log(iiii)
                bdd["liste"][idd] = { "id": idd, "pseudo": nom, "adresse": portefeuille, "ETH": iiii }
                if (a === 1) {
                    ll.channel.send("tu a " + iiii + " ETH, ton portefeuille à été enregistré");
                }
                else {
                }
                Savebdd();
                return result;
            }
        })
    } catch (error) {
        ll.channel.send("Le portefeuille que tu a renseigner n'existe pas");
    }
}

function Savebdd() {
    fs.writeFile("./bdd.json", JSON.stringify(bdd, null, 4), (err) => {
        if (err) message.channel.send("Une erreur est survenue.");
    });
}
client.login(process.env.token);
