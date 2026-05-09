/*  -----------------------------------------------------------------------------------------------
  VARIABLES
--------------------------------------------------------------------------------------------------- */

const OPENAI = {
    API_BASE_URL: 'https://api.openai.com/v1',
    GPT_MODEL: 'gpt-3.5-turbo',
    CHAT_ENDPOINT: '/chat/completions',
    IMAGE_ENDPOINT: '/images/generations'
};

const ingredients = document.querySelectorAll('.ingredient');
const bowlSlots = document.querySelectorAll('.bowl-slot');
const cookButton = document.querySelector('#cook-button');
const loading = document.querySelector('.loading');
const loadingMessage = document.querySelector('.loading-message');
const modal = document.querySelector('.modal');
const modalClose = document.querySelector('.modal-close');
const recipeContent = document.querySelector('.recipe-content');
const recipeImage = document.querySelector('.recipe-image');

let bowl = []; // array with 3 selected ingredients.


/*  -----------------------------------------------------------------------------------------------
  EVENTS
--------------------------------------------------------------------------------------------------- */


// adding ingredients by food selection
ingredients.forEach(function (element) {

    element.addEventListener('click', function () {

        if (API_KEY != '') {
            addIngredient(element.innerText);
        } else {
            alert('API_KEY VARIABLE NOT DEFINED: \nYOU MUST REGISTER AN API KEY TO USE THIS WEB APP AND \nINSERT IT INTO A FILE NAMED config.js\n ie: const API_KEY = "value"; ');
        }
    })

})


// btn to create recipe
cookButton.addEventListener('click', createRecipe);


// btn to close modal
modalClose.addEventListener('click', function () {
    modal.classList.add('hidden'); // hide modal to allow food selection
    location.reload();
})




/*  -----------------------------------------------------------------------------------------------
  FUNCTIONS
--------------------------------------------------------------------------------------------------- */

function addIngredient(ingredient) {

    const maxSlots = bowlSlots.length;

    // before insert
    if (bowl.length === maxSlots) {
        bowl.shift();
    }

    bowl.push(ingredient);

    bowlSlots.forEach(function (slot, index) {
        if (bowl[index]) {
            slot.innerText = bowl[index];
        }
    });

    // after insert
    if (bowl.length === maxSlots) {
        cookButton.classList.remove('hidden'); // show btn to create recipe
    }

}


function getRandomLoadingMessage() {

    const messages = [
        'I prepare the ingredients...',
        'I heat the stove...',
        'Stir in the bowl...',
        'Taking photos for Instagram...',
        'I take the ladle...',
        'I put on an apron...',
        'I wash my hands...',
        'I remove the peels...',
        'I clean the shelf...'
    ];

    const randomIndex = Math.floor(messages.length * Math.random());
    return messages[randomIndex];
}




async function makeRequest(endpoint, payload) {

    // ritorna json format 
    const response = await fetch(OPENAI.API_BASE_URL + endpoint, {
        method: 'POST',
        headers: {
            'Content-type': 'Application/json',
            'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(payload)
    });

    // chat gpt response convertita da json a stringa
    const json = await response.json();
    return json;
}



function clearBowl() {
    bowl = [];

    bowlSlots.forEach(function (slot) {
        slot.innerText = '?';
    })

}





async function createRecipe() {

    loadingMessage.innerText = getRandomLoadingMessage();

    // show loading rotating gif
    loading.classList.remove('hidden');

    // function setInterval
    const interval = setInterval(() => {
        loadingMessage.innerText = getRandomLoadingMessage();
    }, 2000);



    // prepare prompt
    const prompt = `\
    Create a recipe in English with these ingredients: ${bowl.join(', ')}.
    The recipe must be easy and with a creative and fun title.
    Wrap at the end of each ingredient and each instruction by inserting the <br> tag.
    Your responses are just in JSON format like this example:

    ###
    
    {
        "title": "Recipe title",
        "ingredients": "(ingredient icon) - 1 egg.
                        (ingredient icon) - 1 tomato",
        "instructions": "mix the ingredients and put in the oven"
    }
    
    ###` ;


    // console.log(prompt);

    // esegue richiesta a chat gpt - makeRequest(endpoint, payload) - 
    const recipeResponse = await makeRequest(OPENAI.CHAT_ENDPOINT, {
        model: OPENAI.GPT_MODEL,
        messages: [{
            role: 'user',
            content: prompt
        }]
    });

    // console.log(recipeResponse);
    const recipe = JSON.parse(recipeResponse.choices[0].message.content);

    // console.log(recipe);


    loading.classList.add('hidden');
    modal.classList.remove('hidden');
    clearInterval(interval);

    recipeContent.innerHTML = `\
    <h2>${recipe.title}</h2>
    <p>${recipe.ingredients}</p>
    <p>${recipe.instructions}</p>`;

    const imageResponse = await makeRequest(OPENAI.IMAGE_ENDPOINT, {
        prompt: recipe.title,
        n: 1,
        size: '512x512'
    });

    const imageUrl = imageResponse.data[0].url;
    recipeImage.innerHTML = `<img src="${imageUrl}" alt="recipe">`;

    clearBowl();
}
