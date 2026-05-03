import { useNavigate } from "react-router";



const Sample = () => {

    localStorage.setItem('sample', 'True')
    const navigate = useNavigate();
    navigate('/');
    return (
        <div>
            Sample
        </div>
    )
}

export default Sample;