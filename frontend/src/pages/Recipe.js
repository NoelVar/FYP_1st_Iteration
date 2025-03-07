import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router';
import RecipeDetails from '../components/RecipeDetails';
import Loading from '../components/Loading';
import Select from 'react-select'

// NOTE: SETTING BACKEND URL
// const BACKEND = process.env.BACKEND_URL;

// NOTE: RECIPE PAGE LOGIC ------------------------------------------------------------------------
const Recipe = ({setShowNavbar}) => {

    // NOTE: SETTING NAV BAR TO TRUE --------------------------------------------------------------
    useLayoutEffect(() => {
        setShowNavbar(true);
    }, [])

    // NOTE: STATE VARIABLES
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState(null);
    const [filteredRecipes, setFilteredRecipes] = useState(null);
    const [isLoading, setLoading] = useState(true);
    // const [toggle, setToggle] = useState(true);
    const [searchIngred, setSearchIngred] = useState([]);
    const [pickedIngred, setPickedIngred] = useState([]);
    const [searchPrompt, setSearchPrompt] = useState('');

    // NOTE: ADDING TIME FOR LOADING
    useEffect(() => {
        setTimeout(() => setLoading(false), 1000)
    }, [])

    //NOTE: FETCHING RECIPES FROM SERVER ----------------------------------------------------------
    useEffect(() => {
        const fetchRecipes = async () => {
            // console.log(BACKEND)
            const response = await fetch('http://localhost:4000/recipes') // FIXME: REMOVE FULL URL
            const json = await response.json()

            if (response.ok) {
                setRecipes(json)
                setFilteredRecipes(json)

                // FIXME: 3 FOR LOOPS IS NOT EFFICIENT
                const ingredArray = []
                var match = false
                for (var i = 0; i <= json.length-1; i++) {
                    for (var j = 0; j <= json[i].ingredients.length-1; j++) {
                        const ingredientName = json[i].ingredients[j].ingredient
                        // console.log(ingredientName)
                        const option = {value: ingredientName.toLowerCase(), label: ingredientName.toLowerCase()}
                        for (var v = 0; v < ingredArray.length; v++) {
                            if (ingredArray[v].value === option.value) {
                                match = true                                
                            }
                        }
                        if (!match) {
                            ingredArray.push(option) 
                        }                       
                    }
                }
                // console.log(ingredArray)
                setSearchIngred(ingredArray)
            }
        }

        fetchRecipes()
    }, [])

    // NOTE: HANDLING NEW RECIPES -----------------------------------------------------------------
    const reDirect = () => {
        navigate('/newrecipe')
    }

    // NOTE: HANDLING FILTER TOGGLE ---------------------------------------------------------------
    // const handleToggle = (e) => {
    //     e.preventDefault()
    //     setToggle(!toggle)
    // }
    // NOTE: HANDLING SEARCH ----------------------------------------------------------------------
    const handleSearch = (e) => {
        e.preventDefault()
        // NOTE: CHECKS IF AN INGREDIENT HAS BEEN ENETERED
        if (pickedIngred.length > 0) {
            // NOTE: CREATES AN EMPTY ARRAY TO STORE ALL RETURNED RECIEPS
            const filteredRecipes = []
            // NOTE: WILL CHECK EVERY ENTERED INGREDIENT
            for (var j = 0; j <= pickedIngred.length-1; j++) {
                // NOTE: FILTERING THE RECIPES AND STORING THEM IN 'filteredIngredients'
                const filteredIngredients = recipes.filter(
                    (recipe) => {
                        // NOTE: GOING THROUGH EACH INGREDIENT IN EVERY RECIPE
                        for (var i = 0; i <= recipe.ingredients.length-1; i++) {
                            // NOTE: CHECKS IF THE RECIPE INGREDIENT CONTAINS THE SEARCH PROMPT IF SO RETURNS IT
                            if (recipe.ingredients[i].ingredient.toLowerCase().includes(pickedIngred[j].value) === true) {
                                return recipe.ingredients[i].ingredient.toLowerCase().includes(pickedIngred[j].value);
                            }
                        } 
                    }
                )
                // NOTE: STORES THE RETURNED RECIPES IN THE 'filteredRecipes' array
                for (var i = 0; i <= filteredIngredients.length-1; i++) {
                    // NOTE: MAKES SURE THE FILTERED RECIPES DOESNT ALREADY CONTAIN THE OBJECT
                    if (filteredRecipes.indexOf(filteredIngredients[i]) === -1) {
                        filteredRecipes.push(filteredIngredients[i])
                    }
                }
            }
            // NOTE: SETS THE FILTERED RECIPES TO EVERY RETURNED RECIPE
            setFilteredRecipes(filteredRecipes)
        } else {
            // NOTE: IF THERE IS NO SEARCH PROMPT IT RETURNS EVERY RECIPE
            setFilteredRecipes(recipes)
        }
    }

    // NOTE: HANDLING THE INPUT CHANGE ------------------------------------------------------------
    const handleInputChange = (e) => {
        e.preventDefault()
        const searchTerm = e.target.value;
        setSearchPrompt(searchTerm)
    }

    // NOTE: FILTERING THE RECIPES BASED ON THE SEARCH PROMPT -------------------------------------
    const FilterSearchPrompt = (e) => {
        e.preventDefault()
        const filteredItems = recipes.filter((recipe) => 
           recipe.title.toLowerCase().includes(searchPrompt.toLowerCase())
        )
        console.log(filteredItems)
        setFilteredRecipes(filteredItems);
    }

    // NOTE: HANDLING FILTERS ---------------------------------------------------------------------
    const handleFilter = (e) => {
        const filteredIngredients = recipes.filter((recipe) => 
            recipe.difficulty === e.target.value
        )
        setFilteredRecipes(filteredIngredients)
    }

    // NOTE: DISPLAYING RECIPES -------------------------------------------------------------------
    return (
        <div className='main-container'>
            <div className='filter-container'>
                <h2>Filter Search</h2>
                <div className='ingredient-search'>
                    <Select 
                        options={searchIngred} 
                        isMulti={true} 
                        isSearchable={true} 
                        isClearable={true}
                        hideSelectedOptions={true}
                        placeholder='Select Ingredients...'
                        onChange={e => setPickedIngred(e)}
                        className='ingred-select'
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 10,
                        })}
                    />         
                    <button onClick={handleSearch}>Search</button>
                </div>
                <div className='filters'>
                    <form>
                        <span className='hr'></span>
                        <h4>Select a difficulty</h4>
                        <div className='difficulty-filter-radio'>
                            <input 
                                type='radio'
                                name='difficulty'
                                id='easy'
                                value='easy'
                                onChange={handleFilter}
                            />
                            <span className="radio"></span>
                            <label for='easy'>Easy</label>
                        </div>
                        <div className='difficulty-filter-radio'>
                            <input 
                                type='radio'
                                name='difficulty'
                                id='moderate'
                                value='moderate'
                                onChange={handleFilter}
                            />
                            <span className="radio"></span>
                            <label for='moderate'>Moderate</label>
                        </div>
                        <div className='difficulty-filter-radio'>
                            <input 
                                type='radio'
                                name='difficulty'
                                id='hard'
                                value='hard'
                                onChange={handleFilter}
                            />
                            <span className="radio"></span>
                            <label for='hard'>Hard</label>
                        </div>
                        <span className='hr'></span>
                        <h4>Select a origin country</h4>
                        <select>
                            <option selected disabled hidden>Filter by Origin Country</option>
                            <option>Italy</option>
                            <option>Hungary</option>
                            <option>England</option>
                            {/* USE MAP TO ADD ALL COUNTRIES */}
                        </select>
                        <span className='hr'></span>
                        <h4>Select a type of meal</h4>
                        <select>
                            <option selected disabled hidden>Filter by meal type</option>
                            <option>Breakfast</option>
                            <option>Lunch</option>
                            <option>Dinner</option>
                            {/* USE MAP TO ADD ALL COUNTRIES */}
                        </select>
                        <span className='hr'></span>
                        <h4>Select a serving size</h4>
                        <select>
                            <option selected disabled hidden>Filter by serving size</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                        </select>
                        <span className='hr'></span>
                        <h4>Select a total time</h4>
                        <input
                            type='Number' 
                        />
                    </form>
                </div>
            </div>
            <div className='content-container'>
                <h1 className='page-title'>BROWSE RECIPES</h1>
                {/* <p className='page-description'>Find an inspiration for your next big hit!</p> */}
                <form onSubmit={FilterSearchPrompt}>
                    <div className='search-options'>
                        <input 
                            type="text"
                            className='search-field'
                            value={searchPrompt}
                            onChange={handleInputChange}
                            placeholder='Search for a recipe title...'
                        />
                        {/* <button className='search-filter' onClick={handleToggle}><i className='fa fa-bars menu-toggle'></i></button> */}
                    </div>
                </form>
                <div className='add-recipe-container'>
                    <button onClick={reDirect}>+ Add new recipe</button>
                </div>
                <div className='recipes-container'>
                {isLoading 
                    // ADAPTED FROM: REPEATING DISPLAY INSPIRED BY: https://stackoverflow.com/questions/34189370/how-to-repeat-an-element-n-times-using-jsx-and-lodash
                    ? Array.from({length: 10 }, (_, i) => <Loading key={i}/>)
                    : filteredRecipes
                        ? filteredRecipes.map((recipe) => ( <RecipeDetails key={recipe._id} recipe={recipe}/>))
                        : <p>Couldn't display recipes.</p>
                    
                }
                </div>
            </div>
        </div>
    )
}

export default Recipe

// END OF DOCUMENT --------------------------------------------------------------------------------