let playersCount = null;
let playersPerPage = 3;
let pagesAmount = null;

createAccountPerPageDropDown()
fillTable(0, playersPerPage)
getPlayersCount()

function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        console.log(players);
        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = "";
        players.forEach((player) => {
            htmlRows +=
                `<tr>
                    <td class="cell cell_small"> ${player.id}</td>
                    <td class="cell"> ${player.name}</td>
                    <td class="cell"> ${player.title}</td>
                    <td class="cell"> ${player.race}</td>
                    <td class="cell"> ${player.profession}</td>
                    <td class="cell"> ${player.level}</td>
                    <td class="cell"> ${player.birthday}</td>
                    <td class="cell"> ${player.banned}</td>
                </tr>`
        })
        $playersTableBody.insertAdjacentHTML("beforeend", htmlRows);
    })
}

function getPlayersCount() {
    $.get('/rest/players/count', (count) => {
        playersCount = count;
        createPaginationButtons()
    })
}

function createPaginationButtons() {
    pagesAmount = isNaN(playersCount) ? 0 : Math.ceil(playersCount / playersPerPage);
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    let paginationButtonsHtml = "";
    for (let i = 1; i < pagesAmount; i++) {
        paginationButtonsHtml += `<button value="${i - 1}">${i}</button>`;
    }
    $buttonsContainer.insertAdjacentHTML("beforeend", paginationButtonsHtml);
}

function createAccountPerPageDropDown() {
    const $dropDown = document.querySelector('.accounts-per-page');
    const options = createSelectOptions([3,5,10,20],3);
    $dropDown.insertAdjacentHTML('afterbegin',options)
}

function createSelectOptions(optionsArray,defaultValue) {
    let optionHTML = '';
    optionsArray.forEach(option => optionHTML +=
        `<option ${defaultValue === option && 'selected'} value="${option}"> 
            ${option}
        </option>`)
    return optionHTML;
}
