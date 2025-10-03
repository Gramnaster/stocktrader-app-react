import { Link, useNavigation } from 'react-router-dom';
// import mainBackground1 from '../../assets/images/bg-9-tp.png';
import mainBackground2 from '../../assets/images/bg-9-tp-01.png';

const Hero = () => {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full aspect-1440/701 bg-cover bg-center flex justify-center items-center flex-col"
        style={{ backgroundImage: `url(${mainBackground2})` }}
      >
        <h1 className="text-6xl text-center mb-[50px] font-light">
          ORBITAL FINANCES
        </h1>
        <h4 className="mb-[16px]">
          <span className="italic font-bold">
            Sleek. Lightweight. Powerful.{' '}
          </span>{' '}
        </h4>
        <h4 className="max-w-[300px] mb-[46px]">
          {' '}
          <span className=" font-extralight">
            With our advanced technology and sharpest databases, we will take
            your finances to space.{' '}
          </span>
        </h4>
        <button
          type="button"
          className="btn btn-secondary w-[162px] shadow-[0_4px_20px_10px_rgba(34,0,228,0.4)]"
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              Launching...
            </>
          ) : (
            <Link to="/signup">
              <span className="font-bold">Let's Launch!</span>
            </Link>
          )}
          {/* {text} */}
        </button>
      </div>
    </div>
  );
};
export default Hero;
