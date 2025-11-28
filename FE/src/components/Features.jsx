import imgCategorias from '/assets/feature-categorias.png'
import imgLimite from '/assets/feature-limite.jpg'
import imgEstadisticas from  '/assets/feature-estadisticas.jpg'

const featuresList = [
  { 
    title: 'Categoriza tus finanzas', 
    image: imgCategorias,
    description: 'En lugar de tener todos tus gastos acumulados, puedes separarlos por categorías para un mayor orden y control de tu dinero.'
  },
  { 
    title: 'Limita tus gastos', 
    image: imgLimite,
    description: 'Puedes limitar la cantidad de dinero que usas con nuestro limitor de gastos, solo elije una categoría, cantidad máxima y listo. Ahora puedes displinarte sobre cuánto gastas y en qué con solo un click'
  },
  { 
    title: 'Gráficos y estadísticas',
    image: imgEstadisticas,
    description: 'Ahora puedes ver qué tanto has gastado a lo largo de un período de tiempo e incluso ver datos relacionados sobre en qué has gastado más y otros.'
  }
];

function Features() {
  
  return (
    
    <section className="features">
      <h2>¿Qué te ofrecemos aquí en SpendList?</h2>


      <div className="features-container">
        {featuresList.map((feature, index) => (
          <div className="card" key={index}>
            <div className='card-inner'>
              <div className="card-front">
                <div className="image-container">
                                  <p>{feature.title}</p>

                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="feature-img" 
                  />
                </div>
              </div>

              <div className="card-back">
              <p>{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;