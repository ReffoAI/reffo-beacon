import { useCallback, useMemo } from 'react'
import { useAppState, useAppStateDispatch } from '../hooks/useAppState'
// import { useNavigate } from 'react-router-dom'
import { addFavorite, removeFavorite } from '../actions/app'
import { Heart } from 'react-feather'

export function FavoriteInteraction(props: any) {
    const icon = props.isFavorite
        ? <Heart size={24} color={`#d00`} fill={`#d00`} />
        : <Heart size={24} />

    return (
        <div className="favorite-selector">
            <button onClick={props.onClick}>
                {icon}
            </button>
        </div>
    )
}

export function ReffoSummary(props: any) {
    const { name, id, description } = props;
    const { user } = useAppState().app;
    const dispatch = useAppStateDispatch();
    // const navigate = useNavigate();

    const isFavorite = useMemo(() => {
        return user.favorites.includes(id);
    }, [user.favorites, id])
    
    const favoriteHandler = useCallback(() => {

        if (user.id === null) {
            console.info('SHOULD REDIRECT TO LOGIN');
            // navigate('/login');
        }
        
        if (user.favorites.includes(id)) {
            dispatch(removeFavorite(id));
        } else {
            dispatch(addFavorite(id));
        }
    }, [user.id, user.favorites, id, dispatch]);

    return (
        <div className="reffo-summary">
            <h1>{name}</h1>
            <p>{description}</p>
            <FavoriteInteraction
                onClick={favoriteHandler}
                isFavorite={isFavorite} />
        </div>
    )
}

export function ReffoDealsList() {
    const deals = [
        { id: 1, name: 'Best Deal Ever', description: 'Here is a deal you don\'t want to miss!' },
        { id: 2, name: 'Nothing Like it!', description: 'Something has been offered to you for munch time.' },
        { id: 3, name: 'Hungry, Fella?', description: 'Good eats. All day, all night.' },
    ];

    const elements = deals.map((deal, i) => <ReffoSummary {...deal} key={`reffo-summary-${i}`} />);

    return (
        <div className="offers-list">
            {elements}
        </div>
    )
}