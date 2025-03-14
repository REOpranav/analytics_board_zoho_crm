class ZOHO_CRM_GET_RECORD {
    constructor(data, sortOrder = "asc", pageNumber = 1) {
        this.data = data
        this.sortOrder = sortOrder
        this.pageNumber = pageNumber
    }
    async getLeadSource() {
        let pageNumber = 1
        let totalLeads = []
        let nextPageHaving = true
        while (nextPageHaving) {
            try {
                const response = await ZOHO.CRM.API.getAllRecords({ Entity: this.data, sort_order: this.sortOrder, page: pageNumber })
                if (response && response?.status !== 204) {
                    totalLeads = totalLeads.concat(response?.data)
                    pageNumber++
                } else {
                    nextPageHaving = false
                }
            } catch (err) {
                console.log(err.message)
            }
        }

        return await leadSource(totalLeads).then(val => {
            return { lead_source: val.leadSource, totalValueUnderTheSpecificDate: val.totalValueUnderTheSpecificDate }
        })
    }

    async getContactSource(days) {
        console.log(days + 'in Class');
        try {
            const responce = await ZOHO.CRM.API.getAllRecords({ Entity: this.data, sort_order: "asc", page: 1 }) // Lead convertion ratting
            return await leadConvertionRate(responce, days).then(val => { return val.filteredValue })
        } catch (err) {
            console.log(err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    ZOHO.embeddedApp.on("PageLoad", async function (data) {
        mainFunction()
    })
    ZOHO.embeddedApp.init();
})

// main function
const mainFunction = async(days) => {
    function showLoading() {
        document.getElementById('loading').style.display = 'block'
        document.getElementById('content').style.display = 'none'
    }

    function hideLoading() {
        document.getElementById('loading').style.display = 'none'
        document.getElementById('content').style.display = 'block'
    }

    showLoading()
    try {
        const leadSourceData = await new ZOHO_CRM_GET_RECORD("Leads").getLeadSource()
        const leadConverstionRate = await new ZOHO_CRM_GET_RECORD('Contacts').getContactSource(days)

        await convertiondatas(leadSourceData, leadConverstionRate)
        await barChart(leadSourceData)
        await polarChart(leadSourceData)
    } catch (err) {
        console.log(err.message);
    } finally {
        hideLoading()
    }
}

// utils fucntions
const leadSource = async (value, subtractDate = 30) => {

    let leadSource = {}
    let totalValueUnderTheSpecificDate = []

    const todayToSubtractDate = new Date()
    todayToSubtractDate?.setDate(todayToSubtractDate.getDate() - subtractDate)

    value.forEach(fetchedValue => {
        (fetchedValue?.Created_Time >= todayToSubtractDate?.toISOString() && totalValueUnderTheSpecificDate.push(fetchedValue))
        leadSource[fetchedValue?.Lead_Source == 'null' ? 'In-App' : fetchedValue?.Lead_Source ? fetchedValue?.Lead_Source : 'In-App'] = (leadSource[fetchedValue?.Lead_Source == 'null' ? 'In-App' : fetchedValue?.Lead_Source ? fetchedValue?.Lead_Source : 'In-App'] || 0) + 1
    })
    return { leadSource, totalValueUnderTheSpecificDate }
}

const leadConvertionRate = async (value, subtractDate = 30) => {    
    let filteredValue = []

    const todayToSubtractDate = new Date()
    todayToSubtractDate.setDate(todayToSubtractDate.getDate() - subtractDate)    

    let destructureData = value?.data
    destructureData.forEach(fetchedValue => {
        fetchedValue?.Created_Time >= todayToSubtractDate?.toISOString() && fetchedValue?.Data_Source !== "Manual" && filteredValue?.push(fetchedValue)
    })
    return { filteredValue }
}

function polarChart(sourceData) {

    let sourceComingFrom = []
    let sourceCount = []

    let sourceDestructure = sourceData?.lead_source
    for (const sourceValue in sourceDestructure) {
        console.log(sourceValue);

        sourceComingFrom.push(sourceValue == "null" ? 'In-App' : sourceValue)
        sourceCount.push(sourceDestructure[sourceValue])
    }

    const labels = sourceComingFrom;
    const data = {
        labels: labels,
        datasets: [{
            label: 'Source of Leads',
            data: sourceCount,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    }
    const ctx = document.getElementById("myBarChart").getContext("2d");

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    type: "linear",
                    suggestedMax: 10,
                }
            },
            responsive: false, // Prevent automatic resizing
            maintainAspectRatio: false, // Allow custom width & height
            layout: {
                padding: 10, // Optional: Adjust padding around chart
            },
        }
    })
}

function barChart(sourceData) {
    let sourceComingFrom = []
    let sourceCount = []

    let sourceDestructure = sourceData?.lead_source
    for (const sourceValue in sourceDestructure) {
        sourceComingFrom.push(sourceValue == "null" ? 'In-App' : sourceValue)
        sourceCount.push(sourceDestructure[sourceValue])
    }

    const labels = sourceComingFrom;
    const data = {
        labels: labels,
        datasets: [{
            label: 'Source of Leads',
            data: sourceCount,
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)'
            ],
            borderColor: [
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)'
            ],
            borderWidth: 1
        }]
    }
    const ctx = document.getElementById("polarChart").getContext("2d");

    new Chart(ctx, {
        type: 'polarArea',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    type: "linear",
                    suggestedMax: 10,
                }
            },
            responsive: false, // Prevent automatic resizing
            maintainAspectRatio: false, // Allow custom width & height
            layout: {
                padding: 10, // Optional: Adjust padding around chart
            },
        }
    })
}


function convertiondatas(source, convertionData) {
    console.log(source);
    
    const convertion = document.querySelector('.convertionh3')
    convertion.textContent = convertionData?.length

    const leadCounth3 = document.querySelector('.leadCounth3')
    leadCounth3.textContent = source?.totalValueUnderTheSpecificDate?.length
}

async function submitDays() {
    const lastDays = document.querySelector('#lastDays')
    mainFunction(lastDays.value)
}
