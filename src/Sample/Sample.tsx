import { useEffect } from "react";
import { useNavigate } from "react-router";



const Sample = () => {

    const navigate = useNavigate();
    useEffect(() => {
        localStorage.setItem('sample', 'True');
        navigate('/dashboard');
    }, [navigate]);
    return (
        <div>
            Sample
        </div>
    )
}

export default Sample;