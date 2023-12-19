var kodZatenCalisti = false;

$(".istatistikler").waypoint(function () {
    if (!kodZatenCalisti) {
        var counters = $(".count span");
        var countersQuantity = counters.length;
        var counter = [];

        for (i = 0; i < countersQuantity; i++) {
            counter[i] = parseInt(counters[i].innerHTML);
        }

        var count = function (start, value, id) {
            var localStart = start;
            var interval = 40;
            var increment = Math.ceil((value - start) / (4000 / interval));
            var intervalId = setInterval(function () {
                if (localStart < value) {
                    localStart += increment;
                    counters[id].innerHTML = localStart;
                } else {
                    clearInterval(intervalId);
                }
            }, interval);
        }

        for (j = 0; j < countersQuantity; j++) {
            count(0, counter[j], j);
        }

        kodZatenCalisti = true;
    }
}, { offset: "99%" });






/* Form hesaplama ve chart.js kullanım alanı */

let globalData;
let car_marka, car_model, car_type;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

fetch("Edudrift.json").then(data => data.json()).then(data => {
    // Markaları Select içine option olarak aktarma
    globalData = data;

}).then(data => writeMarkas(globalData, "Marka", null))

var selectedData = JSON.parse(sessionStorage.getItem("data"));


function writeMarkas(arr, key, page) {

    if (page == "hesap") {

        setTimeout(() => {
            $(`body #targetMarkaSelect option[value="${selectedData.Marka}"]`).attr("selected", true)
            writeModels(globalData, selectedData.Marka, "Model", "hesap")
        }, 100);

    }
    else {

        let markalar = [...new Set(arr.map(data => data.Marka))];
        markalar.map((data, index) => $(`[data-attr='${key}']`).append(`<option id="${data}-${index}" value="${data}">${data}</option>`))

    }
}

function writeModels(arr, value, key, page) {

    let models = arr.filter(item => String(item.Marka) === String(value))

    let uniqueModels = [...new Set(models.map(data => data[key]))];

    // $(`[data-attr='${key}']`).html(`<option value="null" disabled selected>Model Seçin</option>`)
    let optHTML = "";


    uniqueModels.forEach(model => {

        let optgroup = document.createElement('optgroup');
        optgroup.label = model;

        arr.filter(data => data[key] === model).forEach(data => {
            let option = document.createElement('option');
            option.value = data.Model + "||" + data.Tip + "";
            option.textContent = `${data.Tip}`;
            optgroup.appendChild(option);
        });
        optHTML += optgroup.outerHTML;

    });

    // await delay(5000)
    $(`[data-attr='${key}']`).html(`<option value="null" disabled selected>Model Seçin</option>` + optHTML)

    if (page == "hesap") {
        $(`#targetModelSelect option[value="${String(selectedData.Model)}||${String(selectedData.Tip)}"]`).attr("selected", true)
    }
}

$(`[data-attr="Marka"]`).on("input", function () {
    writeModels(globalData, this.value, "Model")
    car_marka = this.value, car_model = null, car_type = null;
})

$(`[data-attr="Model"]`).on("input", function () {
    car_model = this.value.split("||")[0]
    car_type = this.value.split("||")[1]
})






$(".calculate").on("click", function () {
    if (car_type && car_model) {
        let [data] = globalData.filter(data => String(data.Marka) === String(car_marka) && String(data.Model) === String(car_model) && String(data.Tip) === String(car_type))
        calculate(data.kW, data.kW_s1, data.Nm, data.Nm_s1)
        console.log(data)
        sessionStorage.setItem("data", JSON.stringify(data))

        if ($(this).hasClass("target")) {
            location.pathname = "hesapla.html"
        }
    }
    else {
        alert("Tüm seçimleri yapın")
    }
})

var mixedChart;
let mixedChartDatas;
var ctx = document.getElementById('myChart');

function calculate(b_hp, a_hp, b_np, a_np) {
    if (!mixedChart) {
        mixedChartDatas = {
            datasets: [{
                label: 'Orjinal',
                data: [b_hp, b_np],
                borderColor: 'rgb(84, 84, 84)',
                backgroundColor: 'rgba(84, 84, 84, 1)'
            },
            {
                label: 'ECUTUNED',
                data: [a_hp, a_np],
                borderColor: 'rgb(68, 217, 2)',
                backgroundColor: 'rgba(68, 217, 2, 1)'
            }],
            labels: ['Motor Gücü (HP)', 'Tork (nm)']
        }


        mixedChart = new Chart(ctx, {
            type: 'bar',
            data: mixedChartDatas,
            options: {
                // events: ['mouseenter', 'click', 'touchstart', 'touchmove'],
                plugins: {
                    legend: {
                        position: 'right',
                        usePointStyle: true
                    },
                    title: {
                        display: true,
                        text: `${car_marka} ${car_model} - ${car_type}`,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        var fark_hp = a_hp - b_hp;
        var tdElement = document.getElementById('hpCell');
        $(tdElement).text('+' + fark_hp + ' hp');

        var fark_nm = a_np - b_np;
        var tdElement = document.getElementById('nmCell');
        $(tdElement).text('+' + fark_nm + ' nm');

        var nm_Before = b_np;
        var tdElement = document.getElementById('before_nm');
        $(tdElement).text('+' + nm_Before + ' nm');

        var nm_after = a_np;
        var tdElement = document.getElementById('after_nm');
        $(tdElement).text('+' + nm_after + ' nm');

        var hp_before = b_hp;
        var tdElement = document.getElementById('before_hp');
        $(tdElement).text('+' + hp_before + ' hp');

        var hp_after = a_hp;
        var tdElement = document.getElementById('after_hp');
        $(tdElement).text('+' + hp_after + ' hp');

    }
    else {

        mixedChart.data = {
            datasets: [{
                label: 'Orjinal',
                data: [b_hp, b_np],
                borderColor: 'rgb(84, 84, 84)',
                backgroundColor: 'rgba(84, 84, 84, 1)'
            },
            {
                label: 'ECUTUNED',
                data: [a_hp, a_np],
                borderColor: 'rgb(68, 217, 2)',
                backgroundColor: 'rgba(68, 217, 2, 1)'
            }],
            labels: ['Motor Gücü (HP)', 'Tork (nm)']
        }

        mixedChart.options.plugins.title.text = `${car_marka} ${car_model} - ${car_type}`;

        mixedChart.update();
    }

    console.log("Orjinal: " + b_hp + " - Yazılım: " + a_hp)
    console.log("Orjinal: " + b_np + " - Yazılım: " + a_np)


}

/* Form hesaplama ve chart.js kullanım alanı */
