let accountCount = null;
let accountPerPage = 3;
let accountsAmount = null;
let currentPageNumber = 0;

const RACE_ARRAY = ['HUMAN', 'DWARF', 'ELF', 'GIANT', 'ORC', 'TROLL', 'HOBBIT'];
const PROFESSION_ARRAY = ['WARRIOR', 'ROGUE', 'SORCERER', 'CLERIC', 'PALADIN', 'NAZGUL', 'WARLOCK', 'DRUID'];
const BANNED_ARRAY = ['true', 'false']

initCreateForm()
createAccountPerPageDropDown()
fillTable(currentPageNumber, accountPerPage)
updatePlayersCount()

function initCreateForm() {
    const $raceSelect = document.querySelector('[data-create-race]');
    const $professionSelect = document.querySelector('[data-create-profession]');

    $raceSelect.insertAdjacentHTML('afterbegin', createSelectOptions(RACE_ARRAY, RACE_ARRAY[0]))
    $professionSelect.insertAdjacentHTML('afterbegin', createSelectOptions(PROFESSION_ARRAY, PROFESSION_ARRAY[0]))
}

function fillTable(pageNumber, pageSize) {
    $.get(`http://localhost:8080/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (players) => {
        console.log(players);
        const $playersTableBody = $('.players-table-body')[0];
        let htmlRows = "";
        players.forEach((player) => {
            htmlRows +=
                `<tr class="row" data-account-id="${player.id}">
                    <td class="cell cell_small"> ${player.id}</td>
                    <td class="cell" data-account-name> ${player.name}</td>
                    <td class="cell" data-account-title> ${player.title}</td>
                    <td class="cell" data-account-race> ${player.race}</td>
                    <td class="cell" data-account-profession> ${player.profession}</td>
                    <td class="cell" data-account-level> ${player.level}</td>
                    <td class="cell" data-account-birthday> ${new Date(player.birthday).toLocaleDateString("uk")}</td>
                    <td class="cell" data-account-banned> ${player.banned}</td>
                    <td class="cell cell_auto"> <button class="edit-button" value="${player.id}">
                        <img class="edit-image" src="../img/edit.png" alt="edit"></button></td>
                    <td class="cell cell_auto"> <button class="delete-button" value="${player.id}">
                        <img class="delete-image" src="../img/delete.png" alt="delete"></button></td>
                </tr>`
        })
        Array.from($playersTableBody.children).forEach(row => row.remove())
        $playersTableBody.insertAdjacentHTML("beforeend", htmlRows);

        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => button.addEventListener('click', editAccountHandler))

        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => button.addEventListener('click', removeAccountHandler))
    })
}

function updatePlayersCount() {
    $.get('/rest/players/count', (count) => {
        accountCount = count;
        updatePaginationButtons()
    })
}

function updatePaginationButtons() {
    accountsAmount = isNaN(accountCount) ? 0 : Math.ceil(accountCount / accountPerPage);
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    const childButtonsCount = $buttonsContainer.children.length;
    let paginationButtonsHtml = "";
    for (let i = 1; i <= accountsAmount; i++) {
        paginationButtonsHtml += `<button value="${i - 1}">${i}</button>`;
    }
    if (childButtonsCount !== 0) {
        Array.from($buttonsContainer.children).forEach(node => node.remove())
    }
    $buttonsContainer.insertAdjacentHTML("beforeend", paginationButtonsHtml);
    Array.from($buttonsContainer.children).forEach(button => button.addEventListener('click', onPageChange));
    setActiveButton(currentPageNumber)
}

function createAccountPerPageDropDown() {
    const $dropDown = document.querySelector('.accounts-per-page');
    const options = createSelectOptions([3, 5, 10, 20], 3);
    $dropDown.addEventListener('change', onAccountsPerPageChangeHandler)
    $dropDown.insertAdjacentHTML('afterbegin', options)
}

function onAccountsPerPageChangeHandler(e) {
    accountPerPage = e.currentTarget.value
    fillTable(currentPageNumber, accountPerPage);
    updatePaginationButtons();
}

function onPageChange(e) {
    const targetPageIndex = e.currentTarget.value;
    setActiveButton(targetPageIndex)

    currentPageNumber = targetPageIndex
    fillTable(currentPageNumber, accountPerPage)
    setActiveButton(currentPageNumber)
}

function setActiveButton(buttonIndex = 0) {
    const $buttonsContainer = document.querySelector('.pagination-buttons');
    const $targetButton = Array.from($buttonsContainer.children)[buttonIndex];
    const $currentActiveButton = Array.from($buttonsContainer.children)[currentPageNumber];
    $currentActiveButton.classList.remove('active-pagination-button');
    $targetButton.classList.add('active-pagination-button');
}

function createAccount() {
    const data = {
        name: $('[data-create-name]').val(),
        title: $('[data-create-title]').val(),
        race: $('[data-create-race]').val(),
        profession: $('[data-create-profession]').val(),
        level: $('[data-create-level]').val(),
        birthday: new Date($('[data-create-birthday]').val()).getTime(),
        banned: $('[data-create-banned]').val() === 'on'
    }

    $.ajax({
        url: `/rest/players/`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json",
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, accountPerPage);
        }
    })
}

function removeAccountHandler(e) {
    const accountId = e.currentTarget.value;
    $.ajax({
        url: `/rest/players/${accountId}`,
        type: 'DELETE',
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, accountPerPage);
        }
    })
}

function updateAccount({accountID, data}) {
    $.ajax({
        url: `/rest/players/${accountID}`,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: "application/json",
        success: function () {
            updatePlayersCount();
            fillTable(currentPageNumber, accountPerPage);
        }
    })
}

function editAccountHandler(e) {
    const accountId = e.currentTarget.value;

    const $currentRow = document.querySelector(`.row[data-account-id='${accountId}']`);
    const $currentRemoveButton = $currentRow.querySelector('.delete-button');
    const $currentImage = $currentRow.querySelector('.edit-button img');

    const $currentName = $currentRow.querySelector('[data-account-name]');
    const $currentTitle = $currentRow.querySelector('[data-account-title]');
    const $currentRace = $currentRow.querySelector('[data-account-race]');
    const $currentProfession = $currentRow.querySelector('[data-account-profession]');
    const $currentBanned = $currentRow.querySelector('[data-account-banned]');

    $currentImage.src = "../img/save.png"

    $currentImage.addEventListener('click', () => {
        const params = {
            accountId: accountId,
            data: {
                name: $currentName.childNodes[0].getAttribute('data-value'),
                title: $currentTitle.childNodes[0].getAttribute('data-value'),
                race: $currentRace.childNodes[0].getAttribute('data-value'),
                profession: $currentProfession.childNodes[0].getAttribute('data-value'),
                banned: $currentBanned.childNodes[0].getAttribute('data-value')
            }
        }
        updateAccount(params)
    })

    $currentRemoveButton.classList.add('hidden');

    $currentName.childNodes[0].replaceWith(createInput($currentName.innerHTML))
    $currentTitle.childNodes[0].replaceWith(createInput($currentTitle.innerHTML))
    $currentRace.childNodes[0].replaceWith(createSelect(RACE_ARRAY, $currentRace.innerHTML))
    $currentProfession.childNodes[0].replaceWith(createSelect(PROFESSION_ARRAY, $currentProfession.innerHTML))
    $currentBanned.childNodes[0].replaceWith(createSelect(BANNED_ARRAY, $currentBanned.innerHTML))
}

function createInput(vale) {
    const $htmlInputElement = document.createElement('input');

    $htmlInputElement.setAttribute('type', 'text');
    $htmlInputElement.setAttribute('value', vale);
    $htmlInputElement.setAttribute('data-value', vale);

    $htmlInputElement.addEventListener('input', e => {
        $htmlInputElement.setAttribute('data-value', `${e.currentTarget.value}`)
    })
    return $htmlInputElement;
}

function createSelect(optionsArray, defaultValue) {
    const $options = createSelectOptions(optionsArray, defaultValue);
    const $selectElement = document.createElement('select');
    $selectElement.insertAdjacentHTML('afterbegin', $options);
    $selectElement.setAttribute('data-value', defaultValue);
    $selectElement.addEventListener('change', e => {
        $selectElement.setAttribute('data-value', e.currentTarget.value)
    })
    return $selectElement
}

function createSelectOptions(optionsArray, defaultValue) {
    let optionHTML = '';
    optionsArray.forEach(option => optionHTML +=
        `<option ${defaultValue === option && 'selected'} value="${option}"> 
            ${option}
        </option>`)
    return optionHTML;
}