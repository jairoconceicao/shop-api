using aspnet_api.src.Domain.Enums;
using Xunit;

namespace aspnet_api.Tests.Domain.Enums;

public class FormaPagamentoTests
{
    public class EnumValues
    {
        [Fact]
        public void DeveConterPix()
        {
            Assert.True(Enum.IsDefined(typeof(FormaPagamento), "Pix"));
            Assert.Equal(0, (int)FormaPagamento.Pix);
        }

        [Fact]
        public void DeveConterCartao()
        {
            Assert.True(Enum.IsDefined(typeof(FormaPagamento), "Cartao"));
            Assert.Equal(1, (int)FormaPagamento.Cartao);
        }

        [Fact]
        public void DeveConterBoleto()
        {
            Assert.True(Enum.IsDefined(typeof(FormaPagamento), "Boleto"));
            Assert.Equal(2, (int)FormaPagamento.Boleto);
        }

        [Fact]
        public void DeveTerTresValores()
        {
            var values = Enum.GetValues<FormaPagamento>();
            Assert.Equal(3, values.Length);
        }
    }
}
