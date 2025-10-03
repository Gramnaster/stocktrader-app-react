import separator1 from '../../assets/images/icon-separator-01.png';
import mainBackground3 from '../../assets/images/bg2-1-tp-01.png';
import { Link, useNavigation } from 'react-router-dom';

const FooterCTA = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  return (
    <div className="flex flex-col items-center">
      <img
        src={separator1}
        className="w-[658px] h-[5px] my-15 align-middle justify-center items-center"
      />

      <div
        className="w-full aspect-1440/413 bg-cover bg-center flex justify-center items-center flex-col gap-y-15"
        style={{ backgroundImage: `url(${mainBackground3})` }}
      >
        <h2 className="font-bold text-5xl">Launch your portfolio today</h2>
        <button
          type="button"
          className="btn btn-secondary items-center pb-1 w-[230px] h-[52px] rounded-2xl shadow-[0_4px_20px_10px_rgba(34,0,228,0.4)]"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Launching...
            </>
          ) : (
            <Link to="/signup">
              <span className="font-bold text-2xl">Sign Up Now</span>
            </Link>
          )}
          {/* {text} */}
        </button>
      </div>
    </div>
  );
};
export default FooterCTA;
