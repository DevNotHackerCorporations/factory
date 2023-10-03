types = {
	"Human":{
		"give":150,
		"cost":120,
		"install":100,
		"icon":"https://cdn.iconscout.com/icon/free/png-256/worker-1659453-1409975.png",
		"info":"Slow, inefficent, expensive",
		"onclick":""
	},
	"Horse":{
		"give":200,
		"cost":150,
		"install":750,
		"info":"Lots of food, more efficient",
		"icon":"https://images.vexels.com/media/users/3/131041/isolated/preview/e2ee59c6ed6985faacc1f230d1e45790-horse-polo-circle-icon.png",
		"onclick":""
	},
	"James Watt Steam Engine":{
		"give":200,
		"cost":100,
		"install":1000,
		"info":"Efficient, needs coal + water",
		"icon":"https://i.ibb.co/MB0SzDx/image-removebg-preview.png",
		"onclick":""
	},
	"Accountant":{
		"give":0,
		"cost":20,
		"install":1500,
		"info":"Pays workers for you",
		"icon":"https://cdn-icons-png.flaticon.com/512/1802/1802806.png",
		"onclick":"accountant=true;"
	},
	"Nuclear Plant":{
		"give":1000,
		"cost":200,
		"install":3000,
		"info":"Very efficient",
		"icon":"nuclear_plant.png",
	}
}
stages = [
	[5, 5, 0],
	[7, 7, 20000],
	[9, 9, 40000],
	[11, 11, 80000],
	[0, 0, 0],
	[0, 0, 0],
]
stage = 0
workers = {}
daytime = 2000
paytrack = {}
av = []
nonav = []
coins = 200
numday = 0
accountant = false
jw = false


function refresh(reav=false){
	$("#numcoins").html(coins)
	$("#table").html("")
	$("#numday").html(numday)
	$("#newupgradecost").html("$"+stages[stage+1][2])
	let height = stages[stage][0]
	let width = stages[stage][1]
	$("#numsquares").html(height*width)
	$("#newupgrade").html(stages[stage+1][1]*stages[stage+1][0])
	if (stage >= 3){
		stage = 3;
		$("#newupgradecost").html("No more upgrades.")
		$("#numsquares").html("")
		$("#newupgrade").html("")
	}
	if (reav){
		for (let k = 0; k < height*width; k++){
			if (!nonav.includes(k)){
				// Some trick I leaned that is 6x faster than .push()
				av = [...av, k]
			}
		}
	}
	for (let i = 0;i<height;i++){
		$("#table").append("<tr></tr>")
		for (let j = 0;j<width;j++){
			if (Object.keys(workers).includes((i*height+j).toString())){
				$("#table > tr:nth-of-type("+(i+1)+")").append("<td class='ab'><img height='80px' src='"+(types[workers[i*height+j]].icon)+"'></td>")
			}else{
				$("#table > tr:nth-of-type("+(i+1)+")").append("<td class='ab'></td>")
			}
		}
	}
}
refresh(true)
for (x in types){
	type = types[x]
	abthing = `
	<div class="ab" onclick='hire("${x}");${type.onclick}'>
			<img src="${type.icon}" width="80px">
			<span>${x}</span>
			<span>${type.info}</span>
			<span>Gives you: \$${type.give}/day</span>
			<span>Cost: \$${type.cost}/day</span>
			<span>"Installation" cost: \$${type.install}</span>
		</div>
	`
	if (type.t !== undefined){
		$("#abilities").append(abthing)
	}else{
		$("#hire").append(abthing)
	}
}
function remove(array, target){
	let result = []
	for (let y = 0;y<array.length;y++){
		if (array[y] !== target){
			result = [...result, array[y]]
		}
	}
	return result
}
function hire(hiretype){
	// Awesome trick to detect empty lists
	if (av.length !== 0){
		if (!(types[hiretype].install > coins)){
			nonav.push(av[0])
			workers[parseInt(av[0])] = hiretype
			av = remove(av, av[0])
			coins = coins - types[hiretype].install
			refresh()
		}
	}
}

profits = setInterval(()=>{
	numday += 1
	for (our_worker in workers){
		let our_worker_file =  types[workers[our_worker]]
		coins += (our_worker_file.give)
		if (paytrack[our_worker] === undefined){
			paytrack[our_worker] = new Map()
		}
		if (!accountant){
			paytrack[our_worker].set(numday, numday)
			if (Math.min(...Array.from(paytrack[our_worker].keys()))+7 < numday){
				delete workers[our_worker]
				$(".pay__"+our_worker).remove()
				av.push(parseInt(our_worker))
				av.sort(function(x,y){return x-y})
				nonav = remove(nonav, parseInt(our_worker))
				paytrack[parseInt(our_worker)] = new Map()
				continue
			}
			$("#pay").append(`<div class='ab pay__${our_worker}' onclick="pay(${our_worker}, ${numday});this.remove();">
				<img src="${our_worker_file.icon}" width="80px">
				<span>${workers[our_worker]}</span>
				<span>Square #${parseInt(our_worker)+1}</span>
				<span>Pay for day #${numday}</span>
			</div>`)
		}else{
			if (workers[our_worker] !== "Accountant"){
				pay(our_worker, numday)
			}else{
				paytrack[our_worker].set(numday, numday)
				if (Math.min(...Array.from(paytrack[our_worker].keys())) !== Infinity && Math.min(...Array.from(paytrack[our_worker].keys()))+7 < numday){
					delete workers[our_worker]
					$(".pay__"+our_worker).remove()
					av.push(parseInt(our_worker))
					av.sort(function(x,y){return x-y})
					nonav = remove(nonav, parseInt(our_worker))
					paytrack[parseInt(our_worker)] = new Map()
					continue
				}
				$("#pay").append(`<div class='ab pay__${our_worker}' onclick="pay(${our_worker}, ${numday});this.remove();">
					<img src="${our_worker_file.icon}" width="80px">
					<span>${workers[our_worker]}</span>
					<span>Square #${parseInt(our_worker)+1}</span>
					<span>Pay for day #${numday}</span>
				</div>`)
			}
		}
	}
	refresh()
}, daytime)

function upgrade(){
	if (coins >= stages[stage+1][2]){
		stage += 1
		coins = coins - stages[stage][2]
		refresh()
	}
}
function pay(square_num, day){
	coins = coins - types[workers[square_num]].cost
	paytrack[our_worker].delete(day)
	refresh()
}


function jameswatt(){
	if (!jw && coins >= 7500){
		types["James Watt Steam Engine"].give = 350
		jw = true
		let counter = 0
		let cooldownduration = 100
		$("#jwlabel").html(`Boost (3 days)`)
		$(".jw.innermeter").css("--width", "100%")
		let ii = setInterval(()=>{
			counter += 1
			$("#jwlabel").html(`Boost (${Math.ceil((cooldownduration-counter)/cooldownduration * 3)} days)`)
			$(".jw.innermeter").css("--width", Math.ceil((cooldownduration-counter)/cooldownduration * 100)+"%")
			if (counter === cooldownduration){
				counter = 0 
				let cooldownd = 100
				let ij = setInterval(()=>{
					counter += 1
					$("#jwlabel").html(`Cooldown (${Math.ceil((cooldownduration-counter)/cooldownduration * 10)} days)`)
					$(".jw.innermeter").css("--width", Math.ceil((cooldownduration-counter)/cooldownduration * 100)+"%")
					if (counter == cooldownd){
						jw = false
						$("#jwlabel").html("Ready to use")
						types["James Watt Steam Engine"].give = 200
						clearInterval(ij)
					}
				}, 10000/cooldownd)
				clearInterval(ii)
			}
		}, 6000/cooldownduration)
	}
}

//Music
var audio_started = false;
function startmusic(){
	if (!audio_started){
		audio_started = true;
		audio = document.createElement("audio");
		audio.src = "jetstream.mp3";
		audio.loop = true;
		audio.volume = 0.3;
		audio.id = "background";
		audio.play();
	}
}